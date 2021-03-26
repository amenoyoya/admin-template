import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
} from 'react-admin';

export default (props) => {
  return (
    <List {...props}>
      <Datagrid>
        <TextField source="id" />
        <TextField source="text" />
        <EditButton label="Edit" basePath="/notes" />
        <DeleteButton label="Delete" basePath="/notes" />
      </Datagrid>
    </List>
  );
};