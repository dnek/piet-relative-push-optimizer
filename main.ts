console.time('time');

import fs = require('fs');

//Search l -> r or [ls, le) -> [rs, re).
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

const　rd = re - rs,
  costMemo: number[] = new Array(rd),
  comMemo: string[] = new Array(rd);
let leastMemo = 1;

const optimize = (l: number, r: number) => {
  if(r === 0)return {cost: l === 0 ? 1: 2, command: l === 0 ? 'd': 'd!'};
  const index = r - rs;
  if(costMemo[index] > 0){
    return {cost: costMemo[index], command: comMemo[index]};
  }
  let optimized = false;
  let command = '', cost = r > 0 ? r: -r + 3;
  for(let i = leastMemo, last = cost;i < last; i++){
    const rec = (s: number[], rest: number, com: string) => {
      if(s[s.length - 1] === 0 && com !== 'd!')return;
      if(s.length === 1){
        const num = s[0];
        if(num === r){
          if(!optimized){
            cost = i;
            command = com;
            optimized = true;
          }
        }else if(num - rs > -1 && num < re && costMemo[num - rs] === 0){
          costMemo[num - rs] = i;
          comMemo[num - rs] = com;
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
    if(r < 0)rec([0], i - 2, 'd!');
    leastMemo++;
    if(optimized)break;
  }
  return {cost: cost, command: optimized ? command : r > 0 ? r.toString() : `d!${-r}-`};
};

const filename = `example/${ls}_${le}>${rs}_${re}.txt`;
const ws = fs.createWriteStream(filename, {encoding: 'utf8'});
const all = (le - ls) * rd;
for(let i = ls; i < le; i++){
  const ever = (i - ls) * rd - rs + 1;
  for(let j = 0; j < rd; j++){
    costMemo[j] = 0;
  }
  leastMemo = 1;
  for(let j = rs; j < re; j++){
    let x = optimize(i, j);
    // console.log(`${i} -> ${j} cost: ${x.cost} com: ${x.command}`);
    ws.write(`${i} -> ${j} cost: ${x.cost} com: ${x.command}\n`);
    process.stdout.write(`computing ${i} -> ${j}...${(ever + j) * 100 / all | 0}%        \r`);
  }
}
ws.end();
console.log(`wrote ${all} commands into ${filename}.`);

console.timeEnd('time');