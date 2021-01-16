import * as React from "react";
import { Admin, Resource, ListGuesser } from 'react-admin';
// import jsonServerProvider from 'ra-data-json-server';
import dataProvider from './dataProvider';
import NotesList from './components/NotesList';
import NotesEdit from './components/NotesEdit';
import NotesCreate from './components/NotesCreate';

// 日本語翻訳プラグイン
import japaneseMessages from '@bicstone/ra-language-japanese';
import polyglotI18nProvider from 'ra-i18n-polyglot';

const i18nProvider = polyglotI18nProvider(() => japaneseMessages, 'ja');

// JsonServerから自動的にAdminパネル生成
// const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');
const App = () => (
  <Admin i18nProvider={i18nProvider} dataProvider={dataProvider}>
    {/* <Resource name="notes" list={ListGuesser} /> */}
    <Resource
      name="notes"
      list={NotesList}
      edit={NotesEdit}
      create={NotesCreate}
    />
  </Admin>
);

export default App;