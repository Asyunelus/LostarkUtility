const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')

const cheerio = require("cheerio");
const fetch = require('node-fetch');

let mainWindow;

const createWindow = () => {
  
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Lostark Utility (Asyunelus ver.)",
    webPreferences: {
      nodeIntegration: true,
      preload: path.resolve(__dirname, './preload.js')
    }
  })
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`)

  if (isDev) {
    // Open the DevTools.
    // BrowserWindow.addDevToolsExtension('<location to your react chrome extension>')
    // mainWindow.webContents.openDevTools()
  } else {
    //Menu.setApplicationMenu(null);
  }
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('conn_check', (event, arg) => {
  if (arg == 'test')
    event.sender.send('conn_response', 'CONN_OK')
  else
    event.sender.send('conn_response', 'CONN_FAIL')
});

ParseByUri = async function(uri) {
    return fetch(encodeURI(uri)).then((res) => {
        if (res.status === 200 || res.status === 201) {
            return res.text().then((result) => {
                return result
            });
        } else
            return null
    });
}

const { ReinforceSystem, ReinforceMaterial } = require('./LostarkUtil.js');

const ReinSystemIns = new ReinforceSystem();

//---------------------------------------------------------------------------------
// Reinforce Calculate
//---------------------------------------------------------------------------------
calculate_reinforce = async function(tier, subtier, start, end, isWeapon, options) {
  return new Promise(resolve => {
    let matTable = isWeapon ? ReinSystemIns.get_material_weapon(tier, subtier) : ReinSystemIns.get_material_armor(tier, subtier);

    let result = new ReinforceMaterial(0, 0, 0, 0, 0, 0, 0);

    for(var i = start + 1; i <= end; ++i) {
      var TryCount = ReinSystemIns.get_try_count(i, options, isWeapon);
      var newmat = matTable.get(i);
      newmat.setBreath(ReinSystemIns, i, options, isWeapon);
      result = result.add(newmat.multiply(TryCount));
    }

    resolve(result);
  });
}

ipcMain.on('reinforce_calc', async(event, arg) => {
  var Flag = true;
  var FlagMsg = "response_ok";
  if (arg.tier === undefined || arg.subtier === undefined || isNaN(arg.tier) || isNaN(arg.subtier)) {
    Flag = false;
    FlagMsg = "not_found_target_tier";
  } else if (arg.current === undefined || arg.current.length != 6) {
    Flag = false;
    FlagMsg = "syntax_err_current_rein";
  } else if (arg.target === undefined || arg.target.length != 6) {
    Flag = false;
    FlagMsg = "syntax_err_target_rein";
  }

  if (arg.option === undefined) {
    arg.option = {
      breath: [false, false, false],
      book_weapon: false,
      book_armor: false,
      wisdom: false
    };
  }

  for(var i = 0; i < 6; ++i) {
    if (isNaN(arg.target[i])) {
      Flag = false;
      FlagMsg = "nan_err_reinforce";
      break;
    } else if (isNaN(arg.current[i])) {
      Flag = false;
      FlagMsg = "nan_err_reinforce";
      break;
    } else if (arg.target[i] < arg.current[i]) {
      Flag = false;
      FlagMsg = "range_err_reinforce";
      break;
    }
  }

  if (arg.option.breath === undefined || arg.option.breath.length != 3) {
    arg.option.breath = [false, false, false];
  }

  if (arg.option.book_weapon === undefined) {
    arg.option.book_weapon = false;
  }

  if (arg.option.book_armor === undefined) {
    arg.option.book_armor = false;
  }

  if (arg.option.wisdom === undefined) {
    arg.option.wisdom = false;
  }

  var response = {
    result: Flag,
    result_msg: FlagMsg,
    data: {
      materials: {
      },
      names: {
        material_weapon: ReinSystemIns.get_name_material_weapon(arg.tier, arg.subtier),
        material_armor: ReinSystemIns.get_name_material_armor(arg.tier, arg.subtier),
        stone: ReinSystemIns.get_name_stone(arg.tier, arg.subtier),
        melt: ReinSystemIns.get_name_melt(arg.tier, arg.subtier),
        experience: ReinSystemIns.get_name_experience(arg.tier, arg.subtier),
        breath: [
          ReinSystemIns.get_name_breath(arg.tier, arg.subtier, 0),
          ReinSystemIns.get_name_breath(arg.tier, arg.subtier, 1),
          ReinSystemIns.get_name_breath(arg.tier, arg.subtier, 2),
          ReinSystemIns.get_name_breath(arg.tier, arg.subtier, 3),
          ReinSystemIns.get_name_breath(arg.tier, arg.subtier, 4),
          ""
        ]
      },
      option: arg.option,
      current: arg.current,
      target: arg.target,
      startIL: ReinSystemIns.get_item_levels(arg.tier, arg.subtier, arg.current),
      endIL: ReinSystemIns.get_item_levels(arg.tier, arg.subtier, arg.target),
      notice: "장비 성장 실링은 계산에 포함되지 않아, 표기된 실링보다 더 많이 소모됩니다."
    }
  };

  if (Flag) {
    let AsyncList = new Array();
    for(var i = 0; i < 6; ++i) {
      AsyncList.push(calculate_reinforce(arg.tier, arg.subtier, arg.current[i], arg.target[i], i == 0, arg.option));
    }
    let result = await Promise.all(AsyncList);

    let TotalMaterial = new ReinforceMaterial(0, 0, 0, 0, 0, 0, 0);

    let WeaponMat = 0;
    let ArmorMat = 0;

    for(var i = 0; i < result.length; ++i) {
      TotalMaterial = TotalMaterial.add_without_material(result[i]);
      if (i == 0)
        WeaponMat += result[i].Material;
      else
        ArmorMat += result[i].Material;
    }
    response.data.materials = {
      experience: TotalMaterial.NeedExperience + TotalMaterial.TryExperience,
      material: {
        weapon: WeaponMat,
        armor: ArmorMat
      },
      stone: TotalMaterial.Stone,
      meltmaterial: TotalMaterial.MeltMaterial,
      money: TotalMaterial.TryMoney,
      gold: TotalMaterial.TryGold,
      breath: {
        base: [TotalMaterial.Breath[0], TotalMaterial.Breath[1], TotalMaterial.Breath[2]],
        book_weapon: TotalMaterial.Breath[3],
        book_armor: TotalMaterial.Breath[4]
      }
    };
  }
  event.sender.send('reinforce_calc_response', response)
});

//---------------------------------------------------------------------------------
// Char Search
//---------------------------------------------------------------------------------
ipcMain.on('char_search', async(event, arg) => {
  var response = {
    result: false,
    result_msg: '',
    data: {
      nickname: arg,
      level: {
        expedition: 0,
        base: 0,
        item_current: 0,
        item_record: 0
      },
      title: "",
      guild: "",
      pvp: "",
      wisdom: {
        level: 0,
        name: ""
      },
      equip: {

      }
    }
  };

  try {
  var uri = 'https://lostark.game.onstove.com/Profile/Character/' + arg;
  var result = await ParseByUri(uri)
    if (result === null || result === undefined)
      throw 'Error'
    var $ = cheerio.load(result);

    //원정대레벨
    $('.level-info__expedition').each(function() {
      var divTag = $(this)
      response.data.level.expedition = divTag.children().eq(1).text().trim();
    });

    //전투레벨
    $('.level-info__item').each(function() {
      var divTag = $(this)
      response.data.level.base = divTag.children().eq(1).text().trim();
    });

    //현재 아이템레벨
    $('.level-info2__expedition').each(function() {
      var divTag = $(this)
      response.data.level.item_current = divTag.children().eq(1).text().trim();
    });

    //달성 아이템레벨
    $('.level-info2__item').each(function() {
      var divTag = $(this)
      response.data.level.item_record = divTag.children().eq(1).text().trim();
    });

    //칭호
    $('.game-info__title').each(function() {
      var divTag = $(this)
      response.data.title = divTag.children().eq(1).text().trim();
    });

    //길드
    $('.game-info__guild').each(function() {
      var divTag = $(this)
      response.data.guild = divTag.children().eq(1).text().trim();
    });

    //PVP
    $('.level-info__pvp').each(function() {
      var divTag = $(this)
      response.data.pvp = divTag.children().eq(1).text().trim();
    });

    //영지
    $('.game-info__wisdom').each(function() {
      var divTag = $(this)
      response.data.wisdom.level = divTag.children().eq(1).text().trim();
      response.data.wisdom.name = divTag.children().eq(2).text().trim();
    });

    $('#profile-ability').find('script').each(function() {
      var datas = $(this).html().trim();
      datas = datas.replace("$.Profile", "");
      datas = datas.replace("=", "");
      datas = datas.replace("};", "}");

      response.data.equip = JSON.parse(datas);
    });

    response.result = true;
    response.result_msg = 'response_ok';
  } catch(e) {
    response.result = false;
    response.result_msg = e;
  }
  event.sender.send('char_search_response', response);
});