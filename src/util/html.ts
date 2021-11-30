import type {
  BCMSEntryContentNode,
  BCMSEntryContentNodeHeadingAttr,
  BCMSHtml as BCMSHtmlType,
} from '../types';

function changeParagraphContent(paragraph: any) {
  let change = '';
  for (let i = 0; i < paragraph.content.length; i++) {
    const node = paragraph.content[i];
   
    if (node.type === 'text') {
      change += node.text;
      if (node.marks === 'link') {
        change += `<a href: 'https://youtube.com', target: '_blank' >${change}</a>`;
      }
      if (node.marks === 'bold') {
        change += `<strong>${change}</strong>`;
      }
      if (node.marks === 'italic') {
        change += `<i>${change}</i>`;
      }
      if (node.marks === 'strike') {
        change += `<strike>${change}</strike>`;
      }
      if (node.marks === 'underline') {
        change += `<u>${change}</u>`;
      }
    }}
    return change;
  
}
function changeListItem(node: BCMSEntryContentNode):  any {
  let p = '';
  if (node.content) {
    for (let i = 0; i < node.content.length; i++) {
      const content = node.content[i];
      if (content) {
        if (content.content) {
      for (let j = 0; j < content.content.length; j++) {
        const item = content.content[j];
      console.log('wqwqwq343q', item);
      if (content.type === 'bulletList') {
        console.log("klxdsaa")
        return `${changeListItem(item)}`;
      }
        console.log('wqq', content);
        p += `<li>${changeParagraphContent(content)}</li>`;
      }
     
      }}
    }
  }
  return p;
}
export const BCMSHtml: BCMSHtmlType = {
  nodeToHtml({ node }) {
    let output = '';
    if (node.type !== 'widget') {
      if (node.type === 'paragraph') {
        let text = '';
        if (node.content) {
          text += changeParagraphContent(node);
        }
        output += `<p>${text}</p>`;
      }
      if (node.type === 'heading') {
        const level = (node.attrs as BCMSEntryContentNodeHeadingAttr).level;
        let name = '';
        if (node.content) {
          node.content.forEach((e) => (name = e.text as string));
        }
        output += `<h${level}>${name}</h${level}>`;
      }
      if (node.type === 'bulletList') {
        let text = '';
        if (node.content) {
          for (let i = 0; i < node.content.length; i++) {
            const content = node.content[i];
            console.log('piiy', content);
            text += changeListItem(content);
            console.log('b', text);
          }
        }
        output += `<ul>${text}</ul>`;
      }
      // if (node.type === 'orderedList') {
      //   let text = '';
      //   if (node.content) {
      //     for (let i = 0; i < node.content.length; i++) {
      //       const content = node.content[i];
      //       console.log("lklwew", content)
      //       text += changeListItem(content);
      //       console.log("o", text)
      //     }
      //   }
      //   output += `<ol>${text}</ol>`;
      // }
    } else {
      throw Error('Node of type widget cannot be converted to HTML.');
    }
    return output;
  },
};
