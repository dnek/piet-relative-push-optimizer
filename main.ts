console.time('time');

//Search [ls, le) -> [rs, re). They must be natural integers.
const ls = 65, le = 91, rs = 32, re = 127;

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
      if(rest < 1){
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

for(let i = ls; i < le; i++){
  for(let j = rs; j < re; j++){
    let x = optimize(i, j);
    console.log(`${i} -> ${j} cost: ${x.cost} com: ${x.command}`);
  }
}

console.timeEnd('time');