import { trace } from '../planTypes';
/** First-floor image: no 6101 or 6121; the lower west bay is the Data Centre. */
export const floor1 = [
  trace('6105','LAB',[215,165,500,245],[['south',.88,.99,'north']]),
  trace('6106','LAB',[215,245,390,310],[['south',.77,.96,'north']]),
  trace('north-cabin','CABIN',[390,245,500,310],[],{name:'North faculty cabin',note:'No doorway is legible in the supplied image.'}),
  trace('6107','LAB',[500,165,805,305],[['south',0,.1,'north'],['south',.84,.95,'north']]),
  trace('6108','CABIN',[805,165,1070,305],[],{note:'Access is not legible; no doorway has been invented.'}),
  trace('6104','LAB',[320,478,503,590],[['west',.65,.94,'west']]),
  trace('6103','CR',[320,590,503,688],[['west',.53,.92,'west']]),
  trace('6102','CR',[320,812,503,900],[['west',.58,.96,'west']]),
  trace('data-centre','DATA',[320,900,503,994],[['west',.55,.93,'west']],{name:'Data Centre'}),
  trace('6109','CR',[855,370,1070,460],[['west',.02,.43,'east']]),
  trace('6110','LAB',[855,460,1070,565],[['west',.2,.58,'east']]),
  trace('6111','CABIN',[855,595,1070,670],[['west',.4,.86,'east']]),
  trace('washroom-north','WF',[890,670,1070,720],[['west',.2,.9,'east']],{name:'North washroom'}),
  trace('washroom-south','WF',[890,720,1070,765],[['west',.2,.9,'east']],{name:'South washroom'}),
  trace('6114','CABIN',[855,765,1070,845],[['west',.35,.8,'east']]),
  trace('6115','LAB',[855,875,1070,960],[['west',.27,.72,'east']]),
  trace('6117','CABIN',[855,960,1070,1040],[['west',.2,.67,'east']]),
  trace('6120','LAB',[215,1125,480,1230],[['north',.25,.38,'south']]),
  trace('6119','LAB',[480,1125,785,1230],[['north',.02,.13,'south']]),
  trace('6118','LAB',[785,1125,1070,1230],[['north',.04,.16,'south']]),
];
