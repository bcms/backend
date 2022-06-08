Create a method which will accept BCMS props and will convert them into types for specified language (only JavaScript/JSDoc and TypeScript for now).

> Group

```ts
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

const result = BCMSTypeConverter.typescript(group1);
const resultWillBe = [
  {
    outputFile: 'group/post_author.ts',
    content: `
    /**
     * This is some post group description.
     */
    export interface PostAuthorGroup {
      first_name: string;
      last_name: string;
      media: BCMSMediaParsed;
    }`,
  },
];
```

> Widget

```ts
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
        _id: '1234',
      },
    },
  ],
};

const result = BCMSTypeConverter.typescript(widget1);
const resultWillBe = [
  {
    outputFile: 'widget/author.ts',
    content: `
    import type {PostAuthorGroup} from '../group/post_author.ts';
    
    /**
     * This is some author widget description.
     */
    export interface AuthorWidget {
      description: string;
      author: PostAuthorGroup;
    }`,
  },
  {
    outputFile: 'group/post_author.ts',
    content: `
    /**
     * This is some post group description.
     */
    export interface PostAuthorGroup {
      first_name: string;
      last_name: string;
      media: BCMSMediaParsed;
    }`,
  },
];
```
