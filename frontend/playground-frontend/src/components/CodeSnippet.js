import { func } from "prop-types";
import React, { useState } from "react";
import TitleText from "./mini_components/TitleText";

const CodeSnippet = (props) => {

    const { backendResponse, layers } = props;  

    if (!backendResponse?.success) {
        return (
          backendResponse?.message || (
            <p style={{ textAlign: "center" }}>There are no records to display</p>
          )
        );
      }
    return (
        //Just an example output since I can't print objects out
        //TODO: Make this print out the entire actual code by looking at the layers
        <textarea
            readOnly
            rows = "10"
            style={{width:"100%"}}
            value={codeSnippetFormat(layers)}
        />     
    );
};

/**
 * This function returns necessary code skeleton to train data from local terminal
 * @param {layers[]} layers 
 * @returns string with correct python syntax to 'train' data
 */
function codeSnippetFormat(layers) {
  var codeSnippet = "import torch\n" 
  + "import torch.nn as nn \n"
  + "from torch.autograd import Variable\n" 
  + "class DLModel(nn.Module):\n"
  + "\tdef __init__(self):\n"
  + "\t\t" + layersToString(layers) + "\n \n"
  + "\tdef forward(self, x): \n"
  + "\t\t" + "self.model(x)";
  return codeSnippet;
}


/**
 * Given an array of layers, this function builds a string with all elements of the array after they have applied
 * the layerToString() function
 * @param {layers[]} layers 
 * @returns string in form of 'self.model = nn.Sequential(*[layerToString(layers[0]),... ,layerToString(layers[N-1])])
 */
function layersToString(layers) { 
  var prepend = "self.model = nn.Sequential(*[";
  var layersToString = prepend;
  var resultingList = [];
  for (var i = 0; i < layers.length; i++) {
    resultingList.push(layerToString(layers[i]))
  }
  layersToString += resultingList.join(',') + "])"
  return layersToString
}

/**
 * Depending on layer passed in, this function builds a string with layer's name, and parameters associated to it (if any)
 * @param {layers} layer 
 * @returns string in form of <layer name>(<parameters>)
 */
function layerToString(layer) {
  var layerToString = "" + layer.object_name
  switch (layerToString) {
    case 'nn.Linear':
      layerToString += "(" + layer.parameters.inputSize.value + "," + layer.parameters.outputSize.value + ")";
      break;
    case 'nn.ReLU':
      layerToString += "()"
      break;
    case 'nn.Softmax':
      layerToString += "(" + layer.parameters.inputSize.value + ")"
      break;
    default:
      console.log("Please pick a layer that's been implemented /n")
      break;
  }
  return layerToString;
}

export default CodeSnippet;
