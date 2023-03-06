const { getPackageImports } = require("../../helpers");

// https://github.com/patternfly/patternfly-react/pull/8667
module.exports = {
  meta: { fixable: "code" },
  create: function (context) {
    const onToggleAPIUpdateList = [
      "ApplicationLauncher",
      "BadgeToggle",
      "DropdownToggle",
      "KebabToggle",
      "Toggle",
      "Select",
      "SelectToggle",
    ];
    const imports = getPackageImports(context, "@patternfly/react-core").filter(
      (specifier) => onToggleAPIUpdateList.includes(specifier.imported.name)
    );

    return imports.length === 0
      ? {}
      : {
          JSXOpeningElement(node) {
            const onToggleProp = node.attributes.find(
              (attr) => attr.name.name === "onToggle"
            );

            const { type, params, name } =
              onToggleProp?.value?.expression || {};

            if (
              imports.map((imp) => imp.local.name).includes(node.name.name) &&
              ((type === "ArrowFunctionExpression" && params?.length === 1) ||
                type === "Identifier")
            ) {
              context.report({
                node,
                message: `${node.name.name} onToggle prop has been updated to include the event parameter as its first parameter. onToggle handlers may require an update.`,
                fix(fixer) {
                  const fixes = [];
                  const createReplacerFix = (functionParam) => {
                    const hasParenthesis =
                      context.getTokenAfter(functionParam).value === ")";
                    const replacementParams = `_event, ${functionParam.name}`;

                    return fixer.replaceText(
                      functionParam,
                      hasParenthesis
                        ? replacementParams
                        : `(${replacementParams})`
                    );
                  };

                  if (
                    type === "ArrowFunctionExpression" &&
                    params.length === 1
                  ) {
                    fixes.push(createReplacerFix(params[0]));
                  }

                  if (type === "Identifier") {
                    const currentScope = context.getScope();
                    const matchingVariables = currentScope.variables.find(
                      (variable) => variable.name === name
                    );
                    const matchingDefinition = matchingVariables.defs.find(
                      (def) => def.name.name === name
                    );

                    const definitionParams =
                      matchingDefinition.type === "FunctionName"
                        ? matchingDefinition.node.params
                        : matchingDefinition.node.init.params;

                    if (definitionParams.length === 1) {
                      fixes.push(createReplacerFix(definitionParams[0]));
                    }
                  }

                  return fixes;
                },
              });
            }
          },
        };
  },
};
