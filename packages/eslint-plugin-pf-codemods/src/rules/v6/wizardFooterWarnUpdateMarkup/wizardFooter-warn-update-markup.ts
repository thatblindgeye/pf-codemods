import { Rule } from "eslint";
import { JSXElement } from "estree-jsx";
import { getFromPackage, getAllChildElementsByName } from "../../helpers";

// https://github.com/patternfly/patternfly-react/pull/10378
module.exports = {
  meta: {},
  create: function (context: Rule.RuleContext) {
    const { imports } = getFromPackage(context, "@patternfly/react-core");

    const wizardImport = imports.find(
      (specifier) => specifier.imported.name === "Wizard"
    );
    const wizardStepImport = imports.find(
      (specifier) => specifier.imported.name === "WizardStep"
    );

    return !wizardImport
      ? {}
      : {
          JSXElement(node: JSXElement) {
            if (
              node.openingElement.name.type === "JSXIdentifier" &&
              wizardImport.local.name === node.openingElement.name.name
            ) {
              const wizardFooterProp = node.openingElement.attributes.find(
                (attr) =>
                  attr.type === "JSXAttribute" && attr.name.name === "footer"
              );
              const wizardSteps = wizardStepImport
                ? getAllChildElementsByName(node, wizardStepImport?.local.name)
                : undefined;
              const allWizardStepsHaveFooter = wizardSteps
                ? wizardSteps.every((step) =>
                    step.openingElement.attributes.find(
                      (attr) =>
                        attr.type === "JSXAttribute" &&
                        attr.name.name === "footer"
                    )
                  )
                : false;

              if (wizardFooterProp || allWizardStepsHaveFooter) {
                return;
              }

              context.report({
                node,
                message:
                  "The default WizardFooter now uses an ActionList wrapped around our Button components, rather than just our Button components.",
              });
            }
          },
        };
  },
};
