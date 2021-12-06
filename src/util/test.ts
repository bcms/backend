import { BCMSTypeConverter } from "./type-converter";
import type {
    BCMSGroup, BCMSWidget
  } from '@bcms/types';
const group1 = {
    _id: '1234',
    createdAt: 0,
    updatedAt: 0,
    cid: '1a',
    name: 'post_author',
    label: 'Post author',
    desc: 'This is some post group description.',
    props: [
      {
        id: '1',
        type: 'STRING',
        required: false,
        name: 'first_name',
        label: 'First name',
        array: false,
        defaultData: [''],
      },
      {
        id: '2',
        type: 'STRING',
        required: false,
        name: 'last_name',
        label: 'Last name',
        array: false,
        defaultData: [''],
      },
      {
        id: '2',
        type: 'MEDIA',
        required: false,
        name: 'photo',
        label: 'Photo',
        array: false,
        defaultData: [''],
      },
    ],
  };

  const widget1 = {
    _id: '1234',
    createdAt: 0,
    updatedAt: 0,
    cid: '1a',
    name: 'author',
    label: 'Author',
    desc: 'This is some author widget description.',
    props: [
      {
        id: '1',
        type: 'RICH_TEXT',
        required: false,
        name: 'description',
        label: 'Description',
        array: false,
        defaultData: [],
      },
      {
        id: '2',
        type: 'GROUP_POINTER',
        required: false,
        name: 'Author',
        label: 'Author',
        array: false,
        defaultData: {
          _id: '61a4c16ef0c20535d0231fd5',
        },
      },
    ],
  };
async function start(){
    const result =await BCMSTypeConverter.typescript({target:widget1 as BCMSWidget, type: 'widget', skip: []});
    console.log(result)
}

start().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });