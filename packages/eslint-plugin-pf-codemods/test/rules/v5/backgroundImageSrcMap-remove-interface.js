const ruleTester = require("../../ruletester");
const rule = require("../../../lib/rules/v5/backgroundImageSrcMap-remove-interface");

ruleTester.run("backgroundImageSrcMap-remove-interface", rule, {
  valid: [
    {
      code: `import { BackgroundImage } from '@patternfly/react-core'; const srcObj: SomeType = {};`,
    },
    {
      // No @patternfly/react-core import
      code: `const srcObj: BackgroundImageSrcMap = {};`,
    },
  ],
  invalid: [
    {
      code: `import { BackgroundImageSrcMap } from '@patternfly/react-core'; const srcObj: BackgroundImageSrcMap = {};`,
      output: ` const srcObj = {};`,
      errors: [
        {
          message: `The BackgroundImageSrcMap interface has been removed.`,
          type: "ImportDeclaration",
        },
        {
          message: `The BackgroundImageSrcMap interface has been removed.`,
          type: "Identifier",
        },
      ],
    },
    {
      code: `import { BackgroundImageSrcMap, Foo } from '@patternfly/react-core'; const srcObj: BackgroundImageSrcMap = {};`,
      output: `import {  Foo } from '@patternfly/react-core'; const srcObj = {};`,
      errors: [
        {
          message: `The BackgroundImageSrcMap interface has been removed.`,
          type: "ImportDeclaration",
        },
        {
          message: `The BackgroundImageSrcMap interface has been removed.`,
          type: "Identifier",
        },
      ],
    },
  ],
});
