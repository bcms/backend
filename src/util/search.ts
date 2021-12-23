import { BCMSRepo } from '@bcms/repo';
import type { BCMSGroup, SearchSetItem } from '@bcms/types';
import { search } from '@banez/search';
// import type { BCMSSearch} from '@banez/search/main'

export class BCMSSearchAll {
  static async findValue(t: any, data: string): Promise<any> {
    // const o: { id: string; data: string[]; }[] = []\
    console.log('rtyu', t);
    const value = Object.values(t);
    const allText: string[] = [];
    const dataItems: string[] = [];
    for (let i = 0; i < value.length; i++) {
      const textItem: string[] = [];
      const item = value[i];

      console.log('er', item);
      if (typeof item === 'object' || Array.isArray(item)) {
        dataItems.push(await BCMSSearchAll.findValue(item, data));
      }
      dataItems.push(String(item));

      console.log('dfgu', dataItems);
      textItem.push(...dataItems);

      console.log('popo', textItem);

      allText.push(...textItem);
    
    console.log(allText);
    const op: SearchSetItem = {
      id: t._id,
      data: allText,
    };

    return search({ set: [op], searchTerm: data });
  }

  static async search(data: string) {
    console.log('oiuyt');
    //     const groups = await BCMSRepo.group.findAll();
    // console.log("yuio", groups)

    // for (let j = 0; j < groups.length; j++) {
    //   const group = groups[j];

    const group = await BCMSRepo.group.findById('61b06be5b1e2aabb5b44ddc9');
    // const dataItems = (Object.values(group as BCMSGroup)).map((item) => String(item))
    const allSearch = await BCMSSearchAll.findValue(group as BCMSGroup, data);
    console.log('iop', allSearch);
    //     const p = {
    //       id: group?._id as string,
    //       data: d ,
    //     };
    // console.log("poiuy",group)

    // console.log("uyt",p)
    // console.log(JSON.stringify(d[0].items, null, '  '));
    //  const t =  search({ set: [p], searchTerm: data})
    //  console.log("ok",t)
    return allSearch;
  }
}
