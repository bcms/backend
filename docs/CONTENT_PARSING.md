```ts
const template = {};
const entry = {
  _id: '61a4900fa94f1763375f57b7',
  createdAt: 1638174735111,
  updatedAt: 1638175125977,
  cid: '2',
  templateId: '61a48fdfa94f1763375f57b5',
  userId: '111111111111111111111111',
  status: '',
  meta: [
    {
      lng: 'en',
      props: [
        {
          id: 'f9f6a98f-b4da-4f8f-8a44-74c7621e7cfc',
          data: ['This is blog'],
        },
        {
          id: '4fdaec83-d335-4ca6-824b-fea653dc7acf',
          data: ['this-is-blog'],
        },
        {
          id: 'ac7794fe-a383-411b-921f-00f6a3a9e260',
          data: ['61a48ff5a94f1763375f57b6'],
        },
        {
          id: 'a',
          data: [
            {
              nodes: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Ovo ce biti ' },
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'link',
                          attrs: {
                            href: 'https://google.com',
                            target: '_blank',
                          },
                        },
                      ],
                      text: 'link',
                    },
                    { type: 'text', text: '.' },
                  ],
                },
                {
                  type: 'heading',
                  attrs: { level: 3 },
                  content: [{ type: 'text', text: 'This is heading 3' }],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  content: [
    {
      lng: 'en',
      nodes: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Ovo ce biti ' },
            {
              type: 'text',
              marks: [
                {
                  type: 'link',
                  attrs: { href: 'https://google.com', target: '_blank' },
                },
              ],
              text: 'link',
            },
            { type: 'text', text: '.' },
          ],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'alskdjfhasdf asdfg' }],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'This is heading 3' }],
        },
        {
          type: 'widget',
          attrs: {
            _id: '613b6c9b28637200318a28c6',
            props: [
              { id: '85d2d5e1-63b3-4e25-a703-28b2606305cf', data: ['yo'] },
            ],
          },
        },
      ],
    },
  ],
};

const entryParsed = {
  _id: '61a4900fa94f1763375f57b7',
  createdAt: 1638174735111,
  updatedAt: 1638175125977,
  cid: '2',
  templateId: '61a48fdfa94f1763375f57b5',
  userId: '111111111111111111111111',
  status: '',
  meta: {
    en: {
      title: 'This is blog',
      slug: 'this-is-slug',
      cover_image: {
        // ...
      },
      text: [
        {
          type: 'paragraph',
          value:
            '<p>Ovo ce biti <a href="https://google.com" target="_blank">link</a>.</p>',
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          value: '<h3>This is heading 3</h3>',
        },
      ],
    },
  },
  content: {
    en: [
      {
        type: 'paragraph',
        // HTML
        value:
          '<p>Ovo ce biti <a href="https://google.com" target="_blank">link</a>.</p>',
      },
      {
        type: 'paragraph',
        value: '<p>alskdjfhasdf asdfg</p>',
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        value: '<h3>This is heading 3</h3>',
      },
      {
        type: 'widget',
        attrs: {
          _id: '613b6c9b28637200318a28c6',
        },
        value: {
          yo: 'yo',
        },
      },
    ],
  },
};
```
