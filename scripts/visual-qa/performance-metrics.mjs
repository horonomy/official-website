/** Maximum session-window CLS for chronological shifts already excluding recent input. */
export function cumulativeLayoutShift(shifts) {
  let maximum=0,current=0,first=null,previous=null;
  for(const {start,value} of shifts) {
    if(first===null||start-first>=5000||start-previous>=1000) {current=0;first=start;}
    current+=value;previous=start;maximum=Math.max(maximum,current);
  }
  return maximum;
}
