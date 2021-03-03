//------------------------------------------------------------------------------------------------
// Reinforcce Material - 강화 머티리얼
//------------------------------------------------------------------------------------------------
class ReinforceMaterial {
    constructor(NeedExperience, Material, Stone, MeltMaterial, TryExperience, TryMoney, TryGold) {
        this.NeedExperience = NeedExperience;
        this.Material = Material;
        this.Stone = Stone;
        this.MeltMaterial = MeltMaterial;
        this.TryExperience = TryExperience;
        this.TryMoney = TryMoney;
        this.TryGold = TryGold;
        this.Breath = [0, 0, 0, 0, 0, 0];//은총 축복 가호 야금 재봉 연구
    }

    add_without_material(material) {
        let newmat = new ReinforceMaterial(0, 0, 0, 0, 0, 0, 0);
        newmat.NeedExperience         = this.NeedExperience;
        newmat.Material               = 0                  ;
        newmat.Stone                  = this.Stone         ;
        newmat.MeltMaterial           = this.MeltMaterial  ;
        newmat.TryExperience          = this.TryExperience ;
        newmat.TryMoney               = this.TryMoney      ;
        newmat.TryGold                = this.TryGold       ;
        newmat.Breath                 = this.Breath.slice();

        if (material instanceof ReinforceMaterial) {
            newmat.NeedExperience         += material.NeedExperience;
            newmat.Stone                  += material.Stone         ;
            newmat.MeltMaterial           += material.MeltMaterial  ;
            newmat.TryExperience          += material.TryExperience ;
            newmat.TryMoney               += material.TryMoney      ;
            newmat.TryGold                += material.TryGold       ;
            for(var i = 0; i < newmat.Breath.length; ++i) {
                newmat.Breath[i]          += material.Breath[i];
            }
        }

        return newmat;
    }

    add(material) {
        let newmat = new ReinforceMaterial(0, 0, 0, 0, 0, 0, 0);
        newmat.NeedExperience         = this.NeedExperience;
        newmat.Material               = this.Material      ;
        newmat.Stone                  = this.Stone         ;
        newmat.MeltMaterial           = this.MeltMaterial  ;
        newmat.TryExperience          = this.TryExperience ;
        newmat.TryMoney               = this.TryMoney      ;
        newmat.TryGold                = this.TryGold       ;
        newmat.Breath                 = this.Breath.slice();

        if (material instanceof ReinforceMaterial) {
            newmat.NeedExperience         += material.NeedExperience;
            newmat.Material               += material.Material      ;
            newmat.Stone                  += material.Stone         ;
            newmat.MeltMaterial           += material.MeltMaterial  ;
            newmat.TryExperience          += material.TryExperience ;
            newmat.TryMoney               += material.TryMoney      ;
            newmat.TryGold                += material.TryGold       ;
            for(var i = 0; i < newmat.Breath.length; ++i) {
                newmat.Breath[i]          += material.Breath[i];
            }
        }
        return newmat;
    }

    multiply(value) {
        let newmat = new ReinforceMaterial(0, 0, 0, 0, 0, 0, 0);
        newmat.NeedExperience         = this.NeedExperience;
        newmat.Material               = this.Material      ;
        newmat.Stone                  = this.Stone         ;
        newmat.MeltMaterial           = this.MeltMaterial  ;
        newmat.TryExperience          = this.TryExperience ;
        newmat.TryMoney               = this.TryMoney      ;
        newmat.TryGold                = this.TryGold       ;
        newmat.Breath                 = this.Breath.slice();
        
        //multiply
        newmat.Material               *= value;
        newmat.Stone                  *= value;
        newmat.MeltMaterial           *= value;
        newmat.TryExperience          *= value;
        newmat.TryMoney               *= value;
        newmat.TryGold                *= value;
        for(var i = 0; i < newmat.Breath.length; ++i) {
            newmat.Breath[i]          *= value;
        }
        return newmat;
    }

    setBreath(system, rein, options, isWeapon) {
        var breaths = system.get_use_breath(rein, options, isWeapon);
        for(var i = 0; i < 6; ++i) {
            this.Breath[i] = breaths[i];
        }
    }

    empty() {
        if (this.NeedExperience > 0) return false;
        if (this.Material > 0) return false;
        if (this.Stone > 0) return false;
        if (this.MeltMaterial > 0) return false;
        if (this.TryExperience > 0) return false;
        if (this.TryMoney > 0) return false;
        if (this.TryGold > 0) return false;
        return true;
    }
}

class ReinforceSystem {
    constructor() {
        this.mat_armor = [
            [
                [
                    {},
                    {},
                    {}
                ]
            ],
            [
                [
                    {},
                    {},
                    {}
                ]
            ],
            [
                [
                    {},
                    {},
                    {}
                ]
            ]
        ];
        this.mat_weapon = [
            [
                [
                    {},
                    {},
                    {}
                ]
            ],
            [
                [
                    {},
                    {},
                    {}
                ]
            ],
            [
                [
                    {},
                    {},
                    {}
                ]
            ]
        ];
        this.initialize();
    }

    get_material_armor(tier, subtier) {
        return this.mat_armor[tier - 1][subtier - 1];
    }

    get_material_weapon(tier, subtier) {
        return this.mat_weapon[tier - 1][subtier - 1];
    }

    get_try_count(rein, options, isWeapon) {
        var result = 0;
        var percent = this.get_percent(rein);
        var CurrentPercent = percent[0];
        //축복 종류에 따른 추가 percent 계산

        if (CurrentPercent >= 1) return 1;
        //실제 기댓값 계산
        var TryCount = 0;
        var MeisterOra = 0;
        var pp = 1;
        while(CurrentPercent < 1)
        {
            var BreathPercent = this.calculate_breath_percent(rein, options.breath[0], options.breath[1], options.breath[2], isWeapon ? options.book_weapon : options.book_armor, options.wisdom);
            //최대 상승 확률 제한
            if (CurrentPercent > percent[2] + percent[0])
                CurrentPercent = percent[2] + percent[0];
            //장기백일경우 확률 1고정
            if (MeisterOra >= 1) CurrentPercent = 1;
            ++TryCount;
            result += TryCount * (CurrentPercent + BreathPercent) * pp;
            pp *= (1 - (CurrentPercent + BreathPercent));

            //장기 쌓고 확률 증가
            MeisterOra += (CurrentPercent + BreathPercent) * 0.465;
            CurrentPercent += percent[1];
        }

        if (result < 1) result = 1;

        return result;
    }

    get_name_material_weapon(tier, subtier) {
        switch(tier) {
            case 1:
                return "파괴석 조각";
            case 2:
                return "파괴석";
            case 3:
                return "파괴석 결정";
        }
        return "null";
    }

    get_name_material_armor(tier, subtier) {
        switch(tier) {
            case 1:
                return "수호석 조각";
            case 2:
                return "수호석";
            case 3:
                return "수호석 결정";
        }
        return "null";
    }

    get_name_stone(tier, subtier) {
        var result = "null";
        switch(tier) {
            case 1:
                result = "조화의 돌파석";
                break;
            case 2:
                result = "생명의 돌파석";
                break;
            case 3:
                result = "명예의 돌파석";
                break;
        }
        switch(subtier) {
            case 1:
                break;
            case 2:
                result = "위대한 " + result;
                break;
            case 3:
                result = "경이로운 " + result;
                break;
        }
        return result;
    }

    get_name_breath(tier, subtier, type) {
        var result = "";
        switch(type) {
            case 0:
                result = "은총";
                break;
            case 1:
                result = "축복";
                break;
            case 2:
                result = "가호";
                break;
            case 3:
                if (tier == 3 && subtier == 2) return "야금술 : 단조 응용";
                if (tier == 3 && subtier == 1) return "야금술 : 단조 기본";
                return "";
            case 4:
                if (tier == 3 && subtier == 2) return "재봉술 : 수선 응용";
                if (tier == 3 && subtier == 1) return "재봉술 : 수선 기본";
                return "";
        }
        switch(tier) {
            case 1:
                result = "별의 " + result;
                break;
            case 2:
                result = "달의 " + result;
                break;
            case 3:
                result = "태양의 " + result;
                break;
        }
        return result;
    }

    get_item_levels(tier, subtier, reins) {
        var All = 0;
        for(var i = 0; i < 6; ++i)
            All += this.get_item_level(tier, subtier, reins[i]);
        return Math.ceil(All / 6 * 100) / 100;
    }

    get_item_level(tier, subtier, rein) {
        var Level = (tier - 1) * 500 + 300;
        switch(subtier)
        {
            case 1:
                break;
            case 2:
                rein += 9;
                break;
            case 3:
                rein += 18;
                break;
        }

        for(var i = 0; i <= rein; ++i)
        {
            switch(i)
            {
                case 0:
                case 1:
                    Level += 2;
                    break;
                case 2:
                case 3:
                    Level += 3;
                    break;
                default:
                    if (i < 25)
                        Level += 5;
                    else if (i < 34)
                        Level += 15;
                    else
                        Level += 25;
                    break;
            }
        }

        return Math.ceil(Level * 100) / 100;
    }

    get_name_experience(tier, subtier) {
        switch(tier) {
            case 1:
                return "조화의 파편";
            case 2:
                return "생명의 파편";
            case 3:
                return "명예의 파편";
        }
        return "null";
    }

    get_name_melt(tier, subtier) {
        var result = "null";
        switch(tier) {
            case 1:
                result = "베르닐 융화 재료";
                break;
            case 2:
                result = "칼다르 융화 재료";
                break;
            case 3:
                result = "오레하 융화 재료";
                break;
        }
        switch(subtier) {
            case 1:
                result = "하급 " + result;
                break;
            case 2:
                result = "중급 " + result;
                break;
            case 3:
                result = "상급 " + result;
                break;
        }
        return result;
    }

    calculate_breath_percent(rein, ub1, ub2, ub3, book, wisdom) {
        var per = this.get_breath_percent(rein);
        var Count = this.get_max_breath(rein);

        var percent = 0;
        if (ub1)
            percent += Count[0] * per[0];
        if (ub2)
            percent += Count[1] * per[1];
        if (ub3)
            percent += Count[2] * per[2];

        percent = (percent > per[3] ? per[3] : percent) / 100.0;
        if (book && rein <= 15)
            percent += 0.1;
        if (wisdom && rein <= 15)
            percent += 0.1;
        return percent;
    }

    get_percent(rein) {
        //성공률, 실패증가, 최대확률
        if (rein <= 6)
            return [ 1, 0, 0 ];
        if (rein <= 7)
            return [ 0.6, 0.06, 0.6 ];
        if (rein <= 8)
            return [ 0.45, 0.045, 0.45 ];
        if (rein <= 11)
            return [ 0.3, 0.03, 0.3 ];
        if (rein <= 14)
            return [ 0.15, 0.015, 0.15 ];
        if (rein <= 17)
            return [ 0.1, 0.01, 0.1 ];
        if (rein <= 19)
            return [ 0.05, 0.005, 0.05 ];
        if (rein <= 21)
            return [ 0.03, 0.003, 0.03 ];
        if (rein <= 23)
            return [ 0.01, 0.001, 0.01 ];
        return [ 0.005, 0.0005, 0.005 ];
    }

    get_breath_percent(rein)
    {
        switch(rein)
        {
            case 7:
                return [ 1.67, 3.33, 10, 40 ];
            case 8:
                return [ 1.25, 2.5, 7.5, 45 ];
            case 9:
            case 10:
            case 11:
                return [ 0.84, 1.67, 5, 30 ];
            case 12:
            case 13:
            case 14:
                return [ 0.21, 0.42, 1.25, 15 ];
            case 15:
            case 16:
            case 17:
                return [ 0.14, 0.28, 0.83, 10 ];
            case 18:
            case 19:
                return [ 0.05, 0.09, 0.28, 5 ];
            case 20:
            case 21:
                return [ 0.03, 0.06, 0.17, 3 ];
            case 22:
            case 23:
            case 24:
            case 25:
                return [ 0.01, 0.02, 0.04, 1 ];
        }
        return [ 0.0, 0.0, 0.0 ];
    }

    get_use_breath(rein, options, isWeapon) {
        var result = [0, 0, 0, 0, 0, 0];
        if (rein <= 6) return result;
        //가호 > 은총 > 축복순으로 사용
        let maxBreath = this.get_max_breath(rein);
        let breath_percent = this.get_breath_percent(rein);

        var current = 0;
        var i = 2;
        while(current < breath_percent[3]) {
            if(i == 2 && !options.breath[i]) {
                i = 0;
            } else if(i == 0 && !options.breath[i]) {
                i = 1;
            } else if(i == 1 && !options.breath[i]) {
                break;
            } else {
                result[i] += 1;
                current += breath_percent[i];
                if (result[i] >= maxBreath[i]) {
                    if (i == 2) i = 0;
                    else if (i == 0) i = 1;
                    else break;
                }
            }
        }

        if (isWeapon && options.book_weapon && rein <= 15)
            result[3] += 1;
        if (!isWeapon && options.book_armor && rein <= 15)
            result[4] += 1;
        return result;
    }

    get_max_breath(Reinforce)
    {
        var result = [0, 0, 0];

        if (Reinforce > 6 && Reinforce <= 11)
        {
            result[0] = 12;
            result[1] = 6;
            result[2] = 2;
        }
        else if (Reinforce <= 17)
        {
            result[0] = 24;
            result[1] = 12;
            result[2] = 4;
        } else if (Reinforce <= 22)
        {
            result[0] = 36;
            result[1] = 18;
            result[2] = 6;
        } else
        {
            result[0] = 48;
            result[1] = 24;
            result[2] = 8;
        }

        return result;
    }

    initialize() {
        this.mat_armor[2][0] = this.MakeArray(
            new ReinforceMaterial(474, 82, 2, 0, 22, 11100, 0),
            new ReinforceMaterial(474, 82, 2, 0, 22, 11380, 0),
            new ReinforceMaterial(474, 82, 4, 0, 22, 11660, 0),//3
            new ReinforceMaterial(682, 120, 4, 2, 32, 11960, 0),
            new ReinforceMaterial(682, 120, 4, 2, 32, 12240, 0),
            new ReinforceMaterial(682, 120, 4, 2, 32, 12540, 0),//6
            new ReinforceMaterial(888, 156, 4, 2, 42, 12480, 220),
            new ReinforceMaterial(888, 156, 4, 2, 42, 13160, 220),
            new ReinforceMaterial(888, 156, 4, 2, 42, 13480, 220),//9
            new ReinforceMaterial(1096, 192, 6, 4, 50, 13820, 220),
            new ReinforceMaterial(1096, 192, 6, 4, 50, 14140, 220),
            new ReinforceMaterial(1096, 192, 6, 4, 50, 14500, 220),//12
            new ReinforceMaterial(1304, 228, 6, 4, 60, 14860, 220),
            new ReinforceMaterial(1304, 228, 8, 4, 60, 15220, 220),
            new ReinforceMaterial(1304, 228, 8, 4, 60, 15600, 220),//15
            new ReinforceMaterial(1768, 264, 8, 4, 82, 15980, 230),
            new ReinforceMaterial(2414, 264, 8, 4, 112, 16380, 240),
            new ReinforceMaterial(3276, 264, 8, 4, 152, 16760, 240),//18
            new ReinforceMaterial(4392, 300, 8, 6, 206, 17180, 240),
            new ReinforceMaterial(5926, 300, 10, 6, 278, 17620, 240),
            new ReinforceMaterial(8058, 300, 10, 6, 378, 18040, 240),//21
            new ReinforceMaterial(10868, 336, 10, 6, 514, 18480, 240),
            new ReinforceMaterial(14758, 336, 10, 6, 698, 18940, 240),
            new ReinforceMaterial(20044, 336, 12, 6, 948, 19400, 240),//24
            new ReinforceMaterial(28234, 372, 12, 6, 1288, 19880, 240)
        );
        this.mat_armor[2][1] = this.MakeArray(
            new ReinforceMaterial(2464, 216, 4, 4, 58, 19320, 320),
            new ReinforceMaterial(2464, 216, 6, 4, 58, 19800, 320),
            new ReinforceMaterial(2464, 216, 6, 4, 58, 20300, 320),//3
            new ReinforceMaterial(3544, 310, 6, 4, 82, 20800, 330),
            new ReinforceMaterial(3544, 310, 6, 4, 82, 21300, 330),
            new ReinforceMaterial(3544, 310, 8, 4, 82, 21820, 330),//6
            new ReinforceMaterial(4622, 404, 8, 6, 108, 22380, 330),
            new ReinforceMaterial(4622, 404, 10, 6, 108, 22920, 330),
            new ReinforceMaterial(4622, 404, 10, 6, 108, 23480, 330),//9
            new ReinforceMaterial(5700, 498, 10, 8, 132, 24040, 330),
            new ReinforceMaterial(5700, 498, 10, 8, 132, 24640, 330),
            new ReinforceMaterial(5700, 498, 12, 8, 132, 25240, 330),//12
            new ReinforceMaterial(6778, 592, 12, 8, 158, 25860, 330),
            new ReinforceMaterial(6778, 592, 12, 8, 158, 26500, 330),
            new ReinforceMaterial(6778, 592, 12, 8, 158, 27160, 350),//15
            new ReinforceMaterial(9178, 686, 14, 10, 216, 27820, 350),
            new ReinforceMaterial(12406, 686, 16, 10, 292, 28420, 350),
            new ReinforceMaterial(16824, 686, 16, 12, 396, 29040, 350),//18
            new ReinforceMaterial(23166, 780, 18, 14, 536, 29660, 350),
            new ReinforceMaterial(31464, 780, 20, 14, 728, 30320, 350),
            new ReinforceMaterial(42702, 780, 22, 16, 988, 30980, 360),//21
            new ReinforceMaterial(57348, 874, 24, 18, 1340, 31640, 380),
            new ReinforceMaterial(77804, 874, 26, 20, 1818, 32320, 390),
            new ReinforceMaterial(105536, 874, 28, 22, 2466, 33040, 400),//24
            new ReinforceMaterial(144488, 968, 30, 24, 3346, 33740, 420)
        );
        this.mat_weapon[2][0] = this.MakeArray(
            new ReinforceMaterial(678, 138, 4, 0, 32, 15860, 0),
            new ReinforceMaterial(678, 138, 4, 0, 32, 16240, 0),
            new ReinforceMaterial(678, 138, 6, 0, 32, 16640, 0),//3
            new ReinforceMaterial(974, 198, 6, 2, 46, 17040, 0),
            new ReinforceMaterial(974, 198, 6, 2, 46, 17460, 0),
            new ReinforceMaterial(974, 198, 6, 2, 46, 17900, 0),//6
            new ReinforceMaterial(1272, 258, 8, 4, 60, 18320, 400),
            new ReinforceMaterial(1272, 258, 8, 4, 60, 18780, 400),
            new ReinforceMaterial(1272, 258, 8, 4, 60, 19240, 400),//9
            new ReinforceMaterial(1568, 320, 10, 4, 74, 19720, 400),
            new ReinforceMaterial(1568, 320, 10, 4, 74, 20200, 400),
            new ReinforceMaterial(1568, 320, 10, 4, 74, 20700, 400),//12
            new ReinforceMaterial(1864, 380, 12, 6, 88, 21200, 400),
            new ReinforceMaterial(1864, 380, 12, 6, 88, 21720, 400),
            new ReinforceMaterial(1864, 380, 12, 6, 88, 22260, 400),//15
            new ReinforceMaterial(2544, 440, 12, 6, 120, 22800, 400),
            new ReinforceMaterial(3476, 440, 12, 6, 164, 23380, 400),
            new ReinforceMaterial(4704, 440, 14, 6, 222, 23940, 400),//18
            new ReinforceMaterial(6354, 500, 14, 8, 300, 24520, 400),
            new ReinforceMaterial(8598, 500, 16, 8, 406, 25120, 400),
            new ReinforceMaterial(11688, 500, 16, 8, 552, 25760, 420),//21
            new ReinforceMaterial(15900, 560, 18, 8, 750, 26380, 430),
            new ReinforceMaterial(21540, 560, 18, 8, 1016, 27020, 450),
            new ReinforceMaterial(29256, 560, 20, 8, 1380, 27700, 460),//24
            new ReinforceMaterial(39668, 622, 20, 8, 1872, 28360, 490)
        );
        this.mat_weapon[2][1] = this.MakeArray(
            new ReinforceMaterial(3526, 358, 6, 4, 84, 27600, 600),
            new ReinforceMaterial(3526, 358, 8, 4, 84, 28280, 600),
            new ReinforceMaterial(3526, 358, 8, 4, 84, 28980, 600),//3
            new ReinforceMaterial(5068, 516, 10, 6, 120, 29680, 600),
            new ReinforceMaterial(5068, 516, 10, 6, 120, 30420, 600),
            new ReinforceMaterial(5068, 516, 12, 6, 120, 31160, 640),//6
            new ReinforceMaterial(6610, 672, 12, 6, 156, 31920, 640),
            new ReinforceMaterial(6610, 672, 14, 6, 156, 32700, 640),
            new ReinforceMaterial(6610, 672, 14, 8, 156, 33520, 640),//9
            new ReinforceMaterial(8152, 830, 16, 8, 192, 34340, 640),
            new ReinforceMaterial(8152, 830, 16, 8, 192, 35180, 660),
            new ReinforceMaterial(8152, 830, 18, 8, 192, 36040, 660),//12
            new ReinforceMaterial(9696, 986, 18, 10, 228, 36940, 660),
            new ReinforceMaterial(9696, 986, 20, 10, 228, 37840, 660),
            new ReinforceMaterial(9696, 986, 20, 10, 228, 38760, 660),//15
            new ReinforceMaterial(13014, 1144, 22, 12, 310, 39720, 680),
            new ReinforceMaterial(17714, 1144, 24, 14, 422, 40580, 680),
            new ReinforceMaterial(24012, 1144, 28, 16, 572, 41460, 680),//18
            new ReinforceMaterial(32774, 1300, 30, 18, 776, 42360, 710),
            new ReinforceMaterial(44514, 1300, 32, 20, 1054, 43260, 730),
            new ReinforceMaterial(60480, 1300, 34, 22, 1432, 44200, 750),//21
            new ReinforceMaterial(82372, 1458, 38, 26, 1944, 45160, 780),
            new ReinforceMaterial(111862, 1458, 42, 28, 2640, 46140, 810),
            new ReinforceMaterial(151946, 1458, 44, 32, 3586, 47160, 840),//24
            new ReinforceMaterial(206688, 1614, 48, 36, 4868, 48180, 870)
        );
    }

    MakeArray() {
        let result = new Map();
        for(var i = 0; i < arguments.length; ++i) {
            result.set(i + 1, arguments[i]);
        }
        return result;
    }
}

module.exports.ReinforceSystem = ReinforceSystem;
module.exports.ReinforceMaterial = ReinforceMaterial;