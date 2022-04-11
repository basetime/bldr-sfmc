const { parse } = require('node-html-parser');

const asset = {
  "id": 49208,
  "assetType": {
      "id": 213,
      "name": "layoutblock",
      "displayName": "Layout"
  },
  "name": "TestLayoutBlock",
  "category": {
      "id": 72742,
      "name": "wsProxy",
      "parentId": 69859
  },
  "content": "<table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" role=\"presentation\" style=\"min-width: 100%; \" class=\"stylingblock-content-wrapper\"><tr><td style=\"padding: 10px; \" class=\"stylingblock-content-wrapper camarker-inner\"><table cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\" style=\"width: 100%;\"><tr><td><table cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\" style=\"width: 100%;\"><tr><td valign=\"top\" class=\"responsive-td\" style=\"width: 50%; padding-right: 3px;\"><div data-type=\"slot\" data-key=\"6stm1y6ym8h\"></div></td><td valign=\"top\" class=\"responsive-td\" style=\"width: 50%; padding-left: 3px;\"><div data-type=\"slot\" data-key=\"nxbksafyplq\"></div></td></tr></table></td></tr></table></td></tr></table>",
  "design": "<table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" role=\"presentation\" style=\"min-width: 100%; \" class=\"stylingblock-content-wrapper\"><tr><td style=\"padding: 10px; \" class=\"stylingblock-content-wrapper camarker-inner\"></td></tr></table>",
  "meta": {
      "options": {
          "layout": {
              "key": "two_column",
              "spacing": 6,
              "css": {
                  "padding": 10
              },
              "layoutClass": "contentlayouts-empty",
              "rows": [
                  {
                      "columns": [
                          {
                              "width": 50,
                              "slot": "6stm1y6ym8h"
                          },
                          {
                              "width": 50,
                              "slot": "nxbksafyplq"
                          }
                      ]
                  }
              ],
              "selected": true
          }
      },
      "wrapperStyles": {
          "mobile": {
              "visible": true
          },
          "styling": {
              "padding": "10px"
          }
      }
  },
  "availableViews": [],
  "slots": {
      "6stm1y6ym8h": {
          "content": "<div data-type=\"block\" data-key=\"iyvhyrthrge\"></div>",
          "design": "<p style=\"font-family: arial; color: #CCCCCC; font-size: 12px; font-weight: bold; text-align: center; display: flex; flex-direction: column; justify-content: center; height: 150px; padding: 10px; margin: 0; border: 1px dashed #CCCCCC;\">Drop blocks or content here</p>",
          "blocks": {
              "iyvhyrthrge": {
                  "assetType": {
                      "id": 199,
                      "name": "imageblock"
                  },
                  "content": "<table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" role=\"presentation\" style=\"min-width: 100%; \" class=\"stylingblock-content-wrapper\"><tr><td class=\"stylingblock-content-wrapper camarker-inner\"><table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\"><tr><td align=\"center\"><img data-assetid=\"29204\" src=\"http://image.emailmarketingunderstood.com/lib/fe3711737164047c771578/m/1/60fc1772-0bb3-41fb-bd23-0300b3ae5c4a.png\" alt=\"\" height=\"302\" width=\"78\" style=\"display: block; padding: 0px; text-align: center; border: 0px solid transparent; height: 302px; width: 78px;\"></td></tr></table></td></tr></table>",
                  "design": "<table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" role=\"presentation\" style=\"min-width: 100%; \" class=\"stylingblock-content-wrapper\"><tr><td class=\"stylingblock-content-wrapper camarker-inner\"><div class=\"default-design\"><div style=\"width:100%;height:150px;background: url(data:image/png;base64,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) repeat-x 0 0\"></div></div></td></tr></table>",
                  "meta": {
                      "wrapperStyles": {
                          "mobile": {
                              "visible": true
                          },
                          "styling": {}
                      }
                  },
                  "modelVersion": 2
              }
          },
          "modelVersion": 2
      },
      "nxbksafyplq": {
          "content": "<div data-type=\"block\" data-key=\"9znin82li7k\"></div>",
          "design": "<p style=\"font-family: arial; color: #CCCCCC; font-size: 12px; font-weight: bold; text-align: center; display: flex; flex-direction: column; justify-content: center; height: 150px; padding: 10px; margin: 0; border: 1px dashed #CCCCCC;\">Drop blocks or content here</p>",
          "blocks": {
              "9znin82li7k": {
                  "assetType": {
                      "id": 196,
                      "name": "textblock"
                  },
                  "content": "<table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" role=\"presentation\" style=\"min-width: 100%; \" class=\"stylingblock-content-wrapper\"><tr><td class=\"stylingblock-content-wrapper camarker-inner\">dsfkl;kdsf;jasdjfl;kjsdafjdsa;lku3oiu4iopjakdfslj;laksdf;dasjl;fkjdsajfk jasf;ljsd;lfjdsfkl;kdsf;jasdjfl;kjsdafjdsa;lku3oiu4iopjakdfslj;laksdf;dasjl;fkjdsajfk jasf;ljsd;lfjdsfkl;kdsf;jasdjfl;kjsdafjdsa;lku3oiu4iopjakdfslj;laksdf;dasjl;fkjdsajfk jasf;ljsd;lfjdsfkl;kdsf;jasdjfl;kjsdafjdsa;lku3oiu4iopjakdfslj;laksdf;dasjl;fkjdsajfk jasf;ljsd;lfjdsfkl;kdsf;jasdjfl;kjsdafjdsa;lku3oiu4iopjakdfslj;laksdf;dasjl;fkjdsajfk jasf;ljsd;lfjdsfkl;kdsf;jasdjfl;kjsdafjdsa;lku3oiu4iopjakdfslj;laksdf;dasjl;fkjdsajfk jasf;ljsd;lfjdsfkl;kdsf;jasdjfl;kjsdafjdsa;lku3oiu4iopjakdfslj;laksdf;dasjl;fkjdsajfk jasf;ljsd;lfj</td></tr></table>",
                  "design": "<table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" role=\"presentation\" style=\"min-width: 100%; \" class=\"stylingblock-content-wrapper\"><tr><td class=\"stylingblock-content-wrapper camarker-inner\"><div class=\"default-design\" style=\"height:150px; overflow:hidden;\"><p class=\"textblock\" style=\"margin:0; padding:0; overflow:hidden; display:block;\">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vestibulum nunc feugiat porta consectetur. Sed vehicula vel ante suscipit sagittis. Ut metus metus, feugiat ut laoreet blandit, viverra non mi. Phasellus convallis, mauris ac vehicula posuere, ligula magna mattis ipsum, in sollicitudin nibh lacus eget sapien. Mauris ultricies laoreet ex, a viverra leo ornare eu. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris commodo scelerisque arcu, id semper sem pharetra vel. Sed ut erat auctor lectus pretium blandit gravida vitae enim. Nullam eget ex et enim molestie porttitor. Duis vitae est fringilla, placerat nisi condimentum, tristique purus. Fusce lobortis mauris quis iaculis ultrices. In tempor ligula ac ex tempor rutrum. Pellentesque quis convallis mi.<br><br>Duis mattis, ex a hendrerit ullamcorper, eros massa consectetur elit, vel lobortis justo arcu ac mi magna, blandit sit amet eros id, dapibus cursus justo. Suspendisse mauris odio, aliquet ut ligula in, porta mollis risus. Ut ultrices lectus dolor, sed euismod nulla ultrices ac. Phasellus laoreet ultricies facilisis. Fusce imperdiet maximus ipsum vitae rutrum. Maecenas faucibus vestibulum lorem sit amet varius. Vivamus et ultricies ligula. Mauris semper scelerisque ante id fermentum. Curabitur non odio pellentesque, consectetur odio eu, commodo risus. Mauris egestas elit vel ipsum sagittis fermentum. Cras varius quam ac enim eleifend, eu porttitor odio finibus. Aenean quis finibus dolor. Nunc bibendum aliquam auctor.</p></div></td></tr></table>",
                  "meta": {
                      "wrapperStyles": {
                          "mobile": {
                              "visible": true
                          },
                          "styling": {}
                      }
                  },
                  "modelVersion": 2
              }
          },
          "modelVersion": 2
      }
  },
  "modelVersion": 2
}


const buildSlotContent = (parsedContent, splitContent, content, target) => {
  const updateContent = parsedContent.querySelector(target).innerHTML = content;
  return `${splitContent[0]}${updateContent}${splitContent[1]}`
}

const buildSlots = (blocks, slotObj, splitContent) => {
  const blockObj = slotObj.blocks;

  blocks.map((block) => {
    const blockContent = blockObj[block][content] ? blockObj[block][content] : '';
    const prasedBlockContent = parse(blockContent)
    const blockTarget = `[data-key='${block}']`;
    const splitBlockContent = prasedBlockContent.toString().split(prasedBlockContent.querySelector(blockTarget));
  })


const parseAssetContent = async (asset, key) => {
  const content = asset.content;
  const slots = Object.keys(asset[key]);
  const parsedContent = parse(content);

  slots.map(slot => {
    const target = `[data-key='${slot}']`;
    const slotObj = asset['slots'][slot]
    const blocks = Object.keys(slotObj['blocks']);
    const splitContent = parsedContent.toString().split(parsedContent.querySelector(target));


    console.log(`blocks object`, blocks)
  })


  console.log(slots)
}


// parseAssetContent(asset, 'slots')

// let root = parse(content);
// const contentSplit = root.toString().split(root.querySelector(`[data-key='nxbksafyplq']`));
// const updateSlot = root.querySelector(`[data-key='nxbksafyplq']`).innerHTML = slotContent;
// const updatedContent = `${contentSplit[0]}${updateSlot}${contentSplit[1]}`

// console.log(updatedContent)




const map = '[slots][6stm1y6ym8h][content]'
const mappedAsset = asset.map
console.log('content', mappedAsset)
