import type { BCMSMediaParsed } from '@becomes/cms-client/types'
    
import type {G1Group} from '../group/g1'
  
  /**
  * T1
  */ 
export interface T1Template {
title:string,
slug:string,
one_number:number,
one_boolean_prop:boolean,
color_picker:color_picker,
rich_text:string,
group_pointer:G1Group,
entry_pointer:entry_pointer,
date:date,
widget:widget,
media:BCMSMediaParsed,
enum:enumeration,
tag:tag
} 