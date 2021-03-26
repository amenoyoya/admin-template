import React from 'react';
import { Create, SimpleForm, TextInput } from 'react-admin';

export default (props) => {
  return (
    <Create {...props}>
      <SimpleForm>
        <TextInput source="text" required />
      </SimpleForm>
    </Create>
  );
};