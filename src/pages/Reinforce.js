import React from 'react'
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import update from 'react-addons-update';

const useStyles = makeStyles({
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  reinforce_input: {
    min: 0,
    max: 25,
    display: 'inline-block'
  },
  grid: {
    display: "flex"
  },
  card: {
    margin: 16,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  }
});

const { ipcRenderer } = window;

Number.prototype.format = function(){
    if(this==0) return 0;
 
    var reg = /(^[+-]?\d+)(\d{3})/;
    var n = ((Math.ceil(this * 100) / 100) + '');
 
    while (reg.test(n)) n = n.replace(reg, '$1' + ',' + '$2');
 
    return n;
};
 
// 문자열 타입에서 쓸 수 있도록 format() 함수 추가
String.prototype.format = function(){
    var num = parseFloat(this);
    if( isNaN(num) ) return "0";
 
    return num.format();
};

class Reinforce extends React.Component {
  constructor(props) {
    super(props);

    this.state ={
      calculated: {result: false},
      error: [false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      value: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      error_text: ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      Breath1: false,
      Breath2: false,
      Breath3: false,
      Breath4: false,
      Breath5: false,
      Breath6: false
    };

    this.CalculateBtn.bind(this);

    this.ReinforceCalcResponse = this.ReinforceCalcResponse.bind(this);

    console.log("constructor");
  }

  componentDidMount() {
    ipcRenderer.on('reinforce_calc_response', this.ReinforceCalcResponse);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('reinforce_calc_response', this.ReinforceCalcResponse);
  }

  ReinforceCalcResponse(event, arg) {
    console.log(arg);
    this.setState({calculated: arg});
  }

  onChangeReinInput(event) {
    var idx = parseInt(event.target.getAttribute('idx'));
    if (!isNaN(event.target.value) &&
    (event.target.value >= 0 && event.target.value <= 25 && idx < 12)
    || (event.target.value == 3 && idx == 12)
    || (event.target.value >= 1 && event.target.value <= 2 && idx == 13)
    ) {
      this.setState({
        error: update(this.state.error, {[idx]: {$set: false}}),
        error_text: update(this.state.error_text, {[idx]: {$set: ""}}),
        value: update(this.state.value, {[idx]: {$set: event.target.value}})
      });
    } else {
      event.target.value = event.target.defaultValue;
      var txt = "";
      if (idx == 12)
        txt = "3 ~ 3 사이의 숫자로 입력해주세요.";
      else if (idx == 13)
        txt = "1 ~ 2 사이의 숫자로 입력해주세요.";
      else
        txt = "0 ~ 25 사이의 숫자로 입력해주세요.";
      this.setState({
        error: update(this.state.error, {[idx]: {$set: true}}),
        error_text: update(this.state.error_text, {[idx]: {$set: txt}}),
        value: update(this.state.value, {[idx]: {$set: -1}})
      });
    }
  }

  CalculateBtn = (props) => {
    if (this.state.calculated.result === undefined) {
      alert("아직 사용할 수 없습니다!");
      return;
    }

    for(var i = 0; i < 12; ++i) {
      if (this.state.value[i] < 0 || this.state.value[i] > 25) {
        alert("입력값이 유효하지 않습니다!");
        return;
      }
    }
    var calcinfo = {
      tier: parseInt(this.state.value[12]),
      subtier: parseInt(this.state.value[13]),
      current: [
        parseInt(this.state.value[0]),
        parseInt(this.state.value[1]),
        parseInt(this.state.value[2]),
        parseInt(this.state.value[3]),
        parseInt(this.state.value[4]),
        parseInt(this.state.value[5])
      ],
      target: [
        parseInt(this.state.value[6] ),
        parseInt(this.state.value[7] ),
        parseInt(this.state.value[8] ),
        parseInt(this.state.value[9] ),
        parseInt(this.state.value[10]),
        parseInt(this.state.value[11])
      ],
      option: {
        breath: [this.state.Breath1, this.state.Breath2, this.state.Breath3],
        book_weapon: this.state.Breath4,
        book_armor: this.state.Breath5,
        wisdom: this.state.Breath6
      }
    };

    if (calcinfo.tier != 3) {
      alert("해당 티어는 계산이 불가능합니다.");
      return;
    } else if (calcinfo.subtier < 1 || calcinfo.subtier > 2) {
      alert("해당 티어는 계산이 불가능합니다.");
      return;
    }

    this.state.calculated = {};
    ipcRenderer.send('reinforce_calc', calcinfo);
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.checked });
  }

  render() {
    const { classes } = this.props;
    var result_title = "계산 결과";
    if (this.state.calculated.result !== undefined && this.state.calculated.result === true) {
      result_title = "계산 결과 (IL. " + this.state.calculated.data.startIL + " ~ " + this.state.calculated.data.endIL + ")";
    }
    var calculate_tables = () => {
      if (this.state.calculated.result === undefined || this.state.calculated.result !== true) {
        return (<p/>);
      } else {
        var counts = {
          gold: this.state.calculated.data.materials.gold,
          money: this.state.calculated.data.materials.money,
          material_weapon: this.state.calculated.data.materials.material.weapon,
          material_armor: this.state.calculated.data.materials.material.armor,
          stone: this.state.calculated.data.materials.stone,
          melt: this.state.calculated.data.materials.meltmaterial,
          experience: this.state.calculated.data.materials.experience,
          breath1: this.state.calculated.data.materials.breath.base[0],
          breath2: this.state.calculated.data.materials.breath.base[1],
          breath3: this.state.calculated.data.materials.breath.base[2],
          breath4: this.state.calculated.data.materials.breath.book_weapon,
          breath5: this.state.calculated.data.materials.breath.book_armor,
          breath6: 0
        };
        var prices = {
          material_weapon: this.state.calculated.data.prices.material_weapon,
          material_armor: this.state.calculated.data.prices.material_armor,
          stone: this.state.calculated.data.prices.stone,
          melt: this.state.calculated.data.prices.melt,
          experience: this.state.calculated.data.prices.experience,
          gold: 1,
          money: 0.01,
          breath1: this.state.calculated.data.prices.breath[0],
          breath2: this.state.calculated.data.prices.breath[1],
          breath3: this.state.calculated.data.prices.breath[2],
          breath4: this.state.calculated.data.prices.breath[3],
          breath5: this.state.calculated.data.prices.breath[4],
          breath6: 0
        };

        var merge_base = counts.gold * prices.gold
          + counts.material_weapon * prices.material_weapon
          + counts.material_armor * prices.material_armor
          + counts.melt * prices.melt;
        
        var merge_experience = counts.experience * prices.experience;

        var merge_breath = counts.breath1 * prices.breath1
          + counts.breath2 * prices.breath2
          + counts.breath3 * prices.breath3
          + counts.breath4 * prices.breath4
          + counts.breath5 * prices.breath5
          + counts.breath6 * prices.breath6;

        var merge_money = counts.money * prices.money;

        var merge_stone = counts.stone * prices.stone;
        
        var merge_total = merge_base + merge_breath + merge_money + merge_stone + merge_experience;
        return (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>아이템 이름</TableCell>
                <TableCell align="right">평균 소모 개수</TableCell>
                <TableCell align="right">경매장 가격</TableCell>
                <TableCell align="right">총 가격</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>순수 골드</TableCell>
                <TableCell align="right">{counts.gold.format()} 골드</TableCell>
                <TableCell align="right">{prices.gold} 골드</TableCell>
                <TableCell align="right">{(counts.gold * prices.gold).format()} 골드</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>순수 실링</TableCell>
                <TableCell align="right">{counts.money.format()} 실링</TableCell>
                <TableCell align="right">{prices.money} 골드</TableCell>
                <TableCell align="right">{(counts.money * prices.money).format()} 골드</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{this.state.calculated.data.names.material_weapon}</TableCell>
                <TableCell align="right">{counts.material_weapon.format()} 개</TableCell>
                <TableCell align="right">{prices.material_weapon.format()} 골드</TableCell>
                <TableCell align="right">{(prices.material_weapon * counts.material_weapon).format()} 골드</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{this.state.calculated.data.names.material_armor}</TableCell>
                <TableCell align="right">{counts.material_armor.format()} 개</TableCell>
                <TableCell align="right">{prices.material_armor.format()} 골드</TableCell>
                <TableCell align="right">{(prices.material_armor * counts.material_armor).format()} 골드</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{this.state.calculated.data.names.stone}</TableCell>
                <TableCell align="right">{counts.stone.format()} 개</TableCell>
                <TableCell align="right">{prices.stone.format()} 골드</TableCell>
                <TableCell align="right">{(prices.stone * counts.stone).format()} 골드</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{this.state.calculated.data.names.melt}</TableCell>
                <TableCell align="right">{counts.melt.format()} 개</TableCell>
                <TableCell align="right">{prices.melt.format()} 골드</TableCell>
                <TableCell align="right">{(prices.melt * counts.melt).format()} 골드</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{this.state.calculated.data.names.experience}</TableCell>
                <TableCell align="right">{counts.experience.format()} 개</TableCell>
                <TableCell align="right">{prices.experience.format()} 골드</TableCell>
                <TableCell align="right">{(prices.experience * counts.experience).format()} 골드</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{this.state.calculated.data.names.breath[0]}</TableCell>
                <TableCell align="right">{counts.breath1.format()} 개</TableCell>
                <TableCell align="right">{prices.breath1.format()} 골드</TableCell>
                <TableCell align="right">{(prices.breath1 * counts.breath1).format()} 골드</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{this.state.calculated.data.names.breath[1]}</TableCell>
                <TableCell align="right">{counts.breath2.format()} 개</TableCell>
                <TableCell align="right">{prices.breath2.format()} 골드</TableCell>
                <TableCell align="right">{(prices.breath2 * counts.breath2).format()} 골드</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{this.state.calculated.data.names.breath[2]}</TableCell>
                <TableCell align="right">{counts.breath3.format()} 개</TableCell>
                <TableCell align="right">{prices.breath3.format()} 골드</TableCell>
                <TableCell align="right">{(prices.breath3 * counts.breath3).format()} 골드</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{this.state.calculated.data.names.breath[3]}</TableCell>
                <TableCell align="right">{counts.breath4.format()} 개</TableCell>
                <TableCell align="right">{prices.breath4.format()} 골드</TableCell>
                <TableCell align="right">{(prices.breath4 * counts.breath4).format()} 골드</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{this.state.calculated.data.names.breath[4]}</TableCell>
                <TableCell align="right">{counts.breath5.format()} 개</TableCell>
                <TableCell align="right">{prices.breath5.format()} 골드</TableCell>
                <TableCell align="right">{(prices.breath5 * counts.breath5).format()} 골드</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} align="center">합계 (강화재료)</TableCell>
                <TableCell align="right">{merge_base.format()} 골드</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} align="center">합계 (돌파석)</TableCell>
                <TableCell align="right">{merge_stone.format()} 골드</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} align="center">합계 (파편)</TableCell>
                <TableCell align="right">{merge_experience.format()} 골드</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} align="center">합계 (숨결)</TableCell>
                <TableCell align="right">{merge_breath.format()} 골드</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} align="center">합계 (실링 제외 전부)</TableCell>
                <TableCell align="right">{(merge_total - merge_money).format()} 골드</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} align="center">합계 (실링 포함 전부)</TableCell>
                <TableCell align="right">{merge_total.format()} 골드</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        );
      }
    }
    return (
      <div>
        <Grid container spacing={2}>
          <Grid item className={classes.grid} xs={12} sm={6} md={3}>
            <Card className={classes.card}>
              <CardHeader title="현재 재련 단계"/>
              <CardContent>
                <TextField inputProps={{idx: '1'}} helperText={this.state.error_text[1]} required onChange={this.onChangeReinInput.bind(this)} error={this.state.error[1]} className={classes.reinforce_input} InputProps={{startAdornment: <InputAdornment position="start">+</InputAdornment>,endAdornment: <InputAdornment position="end"> 재련</InputAdornment>}} label="모자" /><p/>
                <TextField inputProps={{idx: '2'}} helperText={this.state.error_text[2]} required onChange={this.onChangeReinInput.bind(this)} error={this.state.error[2]} className={classes.reinforce_input} InputProps={{startAdornment: <InputAdornment position="start">+</InputAdornment>,endAdornment: <InputAdornment position="end"> 재련</InputAdornment>}} label="견갑" /><p/>
                <TextField inputProps={{idx: '3'}} helperText={this.state.error_text[3]} required onChange={this.onChangeReinInput.bind(this)} error={this.state.error[3]} className={classes.reinforce_input} InputProps={{startAdornment: <InputAdornment position="start">+</InputAdornment>,endAdornment: <InputAdornment position="end"> 재련</InputAdornment>}} label="상의" /><p/>
                <TextField inputProps={{idx: '4'}} helperText={this.state.error_text[4]} required onChange={this.onChangeReinInput.bind(this)} error={this.state.error[4]} className={classes.reinforce_input} InputProps={{startAdornment: <InputAdornment position="start">+</InputAdornment>,endAdornment: <InputAdornment position="end"> 재련</InputAdornment>}} label="하의" /><p/>
                <TextField inputProps={{idx: '5'}} helperText={this.state.error_text[5]} required onChange={this.onChangeReinInput.bind(this)} error={this.state.error[5]} className={classes.reinforce_input} InputProps={{startAdornment: <InputAdornment position="start">+</InputAdornment>,endAdornment: <InputAdornment position="end"> 재련</InputAdornment>}} label="장갑" /><p/>
                <TextField inputProps={{idx: '0'}} helperText={this.state.error_text[0]} required onChange={this.onChangeReinInput.bind(this)} error={this.state.error[0]} className={classes.reinforce_input} InputProps={{startAdornment: <InputAdornment position="start">+</InputAdornment>,endAdornment: <InputAdornment position="end"> 재련</InputAdornment>}} label="무기" /><p/>
              </CardContent>
              <CardActions>
              </CardActions>
            </Card>
          </Grid>
          <Grid item className={classes.grid}  xs={12} sm={6} md={3}>
            <Card className={classes.card}>
              <CardHeader title="목표 재련 단계"/>
              <CardContent>
                <TextField inputProps={{idx:'7' }} helperText={this.state.error_text[7]} required onChange={this.onChangeReinInput.bind(this)} error={this.state.error[7]} className={classes.reinforce_input} InputProps={{startAdornment: <InputAdornment position="start">+</InputAdornment>,endAdornment: <InputAdornment position="end"> 재련</InputAdornment>}} label="모자" /><p/>
                <TextField inputProps={{idx:'8' }} helperText={this.state.error_text[8]} required onChange={this.onChangeReinInput.bind(this)} error={this.state.error[8]} className={classes.reinforce_input} InputProps={{startAdornment: <InputAdornment position="start">+</InputAdornment>,endAdornment: <InputAdornment position="end"> 재련</InputAdornment>}} label="견갑" /><p/>
                <TextField inputProps={{idx:'9' }} helperText={this.state.error_text[9]} required onChange={this.onChangeReinInput.bind(this)} error={this.state.error[9]} className={classes.reinforce_input} InputProps={{startAdornment: <InputAdornment position="start">+</InputAdornment>,endAdornment: <InputAdornment position="end"> 재련</InputAdornment>}} label="상의" /><p/>
                <TextField inputProps={{idx:'10'}} helperText={this.state.error_text[10]} required onChange={this.onChangeReinInput.bind(this)} error={this.state.error[10]} className={classes.reinforce_input} InputProps={{startAdornment: <InputAdornment position="start">+</InputAdornment>,endAdornment: <InputAdornment position="end"> 재련</InputAdornment>}} label="하의" /><p/>
                <TextField inputProps={{idx:'11'}} helperText={this.state.error_text[11]} required onChange={this.onChangeReinInput.bind(this)} error={this.state.error[11]} className={classes.reinforce_input} InputProps={{startAdornment: <InputAdornment position="start">+</InputAdornment>,endAdornment: <InputAdornment position="end"> 재련</InputAdornment>}} label="장갑" /><p/>
                <TextField inputProps={{idx:'6' }} helperText={this.state.error_text[6]} required onChange={this.onChangeReinInput.bind(this)} error={this.state.error[6]} className={classes.reinforce_input} InputProps={{startAdornment: <InputAdornment position="start">+</InputAdornment>,endAdornment: <InputAdornment position="end"> 재련</InputAdornment>}} label="무기" /><p/>
              </CardContent>
              <CardActions>
              </CardActions>
            </Card>
          </Grid>
          <Grid item className={classes.grid}  xs={12} sm={12} md={6}>
            <Card className={classes.card}>
              <CardHeader title="계산 옵션"/>
              <CardContent>
                <Typography>IL. 1302 ~ 1370 (3-1T), IL. 1370 ~ (3-2T)</Typography>
                <TextField inputProps={{idx:'12' }} helperText={this.state.error_text[12]} required onChange={this.onChangeReinInput.bind(this)} error={this.state.error[12]} label="메인 티어" /><p/>
                <TextField inputProps={{idx:'13' }} helperText={this.state.error_text[13]} required onChange={this.onChangeReinInput.bind(this)} error={this.state.error[13]} label="서브 티어" /><p/>
                <FormControlLabel
                  control={<Checkbox checked={this.state.Breath1} onChange={this.handleChange} name="Breath1"/>}
                   label="은총 사용"/><p/>
                <FormControlLabel
                  control={<Checkbox checked={this.state.Breath2} onChange={this.handleChange} name="Breath2"/>}
                   label="축복 사용"/><p/>
                <FormControlLabel
                  control={<Checkbox checked={this.state.Breath3} onChange={this.handleChange} name="Breath3"/>}
                   label="가호 사용"/><p/>
                <FormControlLabel
                  control={<Checkbox checked={this.state.Breath4} onChange={this.handleChange} name="Breath4"/>}
                   label="야금술 사용"/><p/>
                <FormControlLabel
                  control={<Checkbox checked={this.state.Breath5} onChange={this.handleChange} name="Breath5"/>}
                   label="재봉술 사용"/><p/>
                <FormControlLabel
                  control={<Checkbox checked={this.state.Breath6} onChange={this.handleChange} name="Breath6"/>}
                   label="영지 연구 완료"/><p/>
                <Button variant="outlined" size="small" fullWidth={true} onClick={this.CalculateBtn}>{
                  this.state.value[12] >= 0 && this.state.value[13] >= 0 ? this.state.value[12] + "-" + this.state.value[13] + " 티어 " : ""
                }계산</Button>
              </CardContent>
              <CardActions>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item className={classes.grid}  xs={12} sm={12} md={12}>
            <Card className={classes.card}>
              <CardHeader title={result_title}/>
              <CardContent>
                {calculate_tables()}
              </CardContent>
              <CardActions>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(useStyles)(Reinforce);