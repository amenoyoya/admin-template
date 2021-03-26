import React from "react";
import {render} from 'react-dom';
import { Admin, Resource, ListGuesser } from 'react-admin';
import dataProvider from './lib/ra-data-monedb';
import NotesList from './components/NotesList';
import NotesEdit from './components/NotesEdit';
import NotesCreate from './components/NotesCreate';

// 日本語翻訳プラグイン
import japaneseMessages from '@bicstone/ra-language-japanese';
import polyglotI18nProvider from 'ra-i18n-polyglot';

const i18nProvider = polyglotI18nProvider(() => japaneseMessages, 'ja');

const App = () => (
  <Admin i18nProvider={i18nProvider} dataProvider={dataProvider}>
    {/*<Resource name="notes" list={ListGuesser} />*/}
    <Resource
      name="notes"
      list={NotesList}
      edit={NotesEdit}
      create={NotesCreate}
    />
  </Admin>
);

render(<App />, document.getElementById('app'));