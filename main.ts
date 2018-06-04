console.time('time');

import fs = require('fs');

//Search l -> r or [ls, le) -> [rs, re).
//They must be natural integers.
let ls = 0, le = 1, rs = 0, re = 1;
switch (process.argv.length) {
  case 4:
    ls = Number(process.argv[2]);
    le = Number(process.argv[2]) + 1;
    rs = Number(process.argv[3]);
    re = Number(process.argv[3]) + 1;
    break;
  case 6:
    ls = Number(process.argv[2]);
    le = Number(process.argv[3]);
    rs = Number(process.argv[4]);
    re = Number(process.argv[5]);
    break;
  default:
    console.log(`${process.argv.length} args is invalid.`);
    process.exit(1);
    break;
}

const costMemo: number[][] = new Array(le),
  comMemo: string[][] = new Array(le),
  leastMemo: number[] = new Array(le);
for(let i = 0; i < le; i++){
  costMemo[i] = new Array(re);
  comMemo[i] = new Array(re);
  leastMemo[i] = 1;
  for(let j = 0; j < re; j++){
    costMemo[i][j] = 0;
    comMemo[i][j] = '';
  }
}

const optimize = (l: number, r: number) => {
  if(costMemo[l][r] > 0){
    return {cost: costMemo[l][r], command: comMemo[l][r]};
  }
  let optimized = false;
  let command = '', cost = r;
  for(let i = leastMemo[l]; i < r; i++){
    const rec = (s: number[], rest: number, com: string) => {
      if(s.length === 1){
        const num = s[0];
        if(num === r){
          if(!optimized){
            cost = i;
            command = com;
            optimized = true;
          }
        }else if(num > -1 && num < re && costMemo[l][num] === 0){
          costMemo[l][num] = i;
          comMemo[l][num] = com;
        }
      }
      if(rest < 1 || s.length > rest + 1){
        return;
      }
      for(let j = rest - 1; j > 0; j--){
        rec(s.concat(j), rest - j, com + j.toString());
      }
      if(s.length < 1)return;
      rec(s.concat(s[s.length - 1]), rest - 1, com + 'd');
      if(s.length < 2)return;
      let pr = s.pop(), pl = s.pop();
      rec(s.concat(pl + pr), rest - 1, com + '+');
      rec(s.concat(pl - pr), rest - 1, com + '-');
      rec(s.concat(pl * pr), rest - 1, com + '*');
      if(pr === 0)return;
      rec(s.concat(pl / pr | 0), rest - 1, com + '/');

      // let mod = pl % pr;
      // if(mod < 0)mod += pr;
      // rec(s.concat(mod), rest - 1, com + '%');
      
      //MOD seems rarely appears, so commented.
    };

    for(let j = i - 1; j > 0; j--){
      rec([j], i - j, j.toString());
    }
    rec([l], i - 1, 'd');
    leastMemo[l]++;
    if(optimized)break;
  }
  return {cost: cost, command: optimized ? command : r.toString()};
};

const filename = `example/${ls}-${le}_${rs}-${re}.txt`;
const ws = fs.createWriteStream(filename, {encoding: 'utf8'});
const all = (le - ls) * (re - rs);
for(let i = ls; i < le; i++){
  const ever = (i - ls) * (re - rs) - rs + 1;
  for(let j = rs; j < re; j++){
    let x = optimize(i, j);
    // console.log(`${i} -> ${j} cost: ${x.cost} com: ${x.command}`);
    ws.write(`${i} -> ${j} cost: ${x.cost} com: ${x.command}\n`);
    process.stdout.write(`computing...${(ever + j) * 100 / all | 0}%\r`);
  }
}
ws.end();
console.log(`wrote ${all} commands into ${filename}.`);

console.timeEnd('time');