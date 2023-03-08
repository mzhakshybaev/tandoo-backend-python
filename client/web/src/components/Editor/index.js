import React, {Fragment} from "react";
import HeadlinesButton from "./Headlines"

import Editor, {composeDecorators} from 'draft-js-plugins-editor';
import createToolbarPlugin, {Separator} from 'draft-js-static-toolbar-plugin';
import createImagePlugin from 'draft-js-image-plugin';
import createAlignmentPlugin from 'draft-js-alignment-plugin';
import createFocusPlugin from 'draft-js-focus-plugin';
import createResizeablePlugin from 'draft-js-resizeable-plugin';
import createBlockDndPlugin from 'draft-js-drag-n-drop-plugin';
import createDragNDropUploadPlugin from '@mikeljames/draft-js-drag-n-drop-upload-plugin';
import {BoldButton, ItalicButton, OrderedListButton, UnderlineButton, UnorderedListButton,} from 'draft-js-buttons';
import 'draft-js-static-toolbar-plugin/lib/plugin.css';
import 'draft-js-alignment-plugin/lib/plugin.css';
import 'draft-js-focus-plugin/lib/plugin.css';

// TODO: move configuration into functions

// DEFAULT PLUGINS
const focusPlugin = createFocusPlugin();
const resizeablePlugin = createResizeablePlugin();
const blockDndPlugin = createBlockDndPlugin();
const alignmentPlugin = createAlignmentPlugin();

const decorator = composeDecorators(
  resizeablePlugin.decorator,
  alignmentPlugin.decorator,
  focusPlugin.decorator,
  blockDndPlugin.decorator
);
const imagePlugin = createImagePlugin({decorator});

const toolbarPlugin = createToolbarPlugin({
  structure: [
    BoldButton,
    ItalicButton,
    UnderlineButton,
    Separator,
    HeadlinesButton,
    UnorderedListButton,
    OrderedListButton,
  ]
});

const dragNDropFileUploadPlugin = createDragNDropUploadPlugin({
  handleUpload: {},
  addImage: imagePlugin.addImage,
});

const plugins = [
  toolbarPlugin,
  dragNDropFileUploadPlugin,
  blockDndPlugin,
  focusPlugin,
  alignmentPlugin,
  resizeablePlugin,
  imagePlugin
];


// READONLY CONFIG
const readOnlyDecorators = composeDecorators(
  resizeablePlugin.decorator,
  alignmentPlugin.decorator,
);

const readOnlyImagePlugin = createImagePlugin({decorator: readOnlyDecorators});

const readOnlyPlugins = [alignmentPlugin, resizeablePlugin, readOnlyImagePlugin];


// COMPONENTS
const {AlignmentTool} = alignmentPlugin;
const {Toolbar} = toolbarPlugin;

export default ({editorState, onChange, readOnly = false}) => {
  let extraProps = {readOnly, plugins: readOnlyPlugins};
  let components = null;
  if (!readOnly) {
    extraProps = {plugins: plugins};
    components = <Fragment>
      <Toolbar/>
      <AlignmentTool/>
    </Fragment>
  }
  return <div className={"editor"}>
    <Editor
      editorState={editorState}
      onChange={onChange}
      {...extraProps}/>
    {components}
  </div>
};

export const uploadImages = async (entityMap, uploader) => {
  return await Promise.all(Object.keys(entityMap).map(key => {
    let entity = entityMap[key];
    let split = entity.data.src.split(",");
    if (split.length === 1)
      return Promise.resolve(split[0]);
    return uploader({file: split[1]})
  }));
};
