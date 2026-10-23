import ts from 'typescript';
import fs from 'fs';
import path from 'path';

const HOOK_REGEX = /^use[A-Z]/;

function checkFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const errors = [];

  function visit(node, functionContext = null) {
    let currentFunc = functionContext;

    if (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node)
    ) {
      // Check if this function looks like a React component or custom hook
      const name = node.name?.text || '';
      const isComponentOrHook = /^[A-Z]/.test(name) || /^use[A-Z]/.test(name);
      currentFunc = {
        name: name || 'anonymous',
        hasReturned: false,
        isComponentOrHook,
        node,
      };
    }

    // If we are at the top level of a component function
    if (currentFunc && currentFunc.isComponentOrHook) {
      if (ts.isReturnStatement(node) && node.parent === currentFunc.node.body) {
        // Direct child statement of function body
        currentFunc.hasReturned = true;
      } else if (
        ts.isIfStatement(node) &&
        node.parent === currentFunc.node.body
      ) {
        // If the if statement's thenStatement has a return statement
        if (
          ts.isReturnStatement(node.thenStatement) ||
          (ts.isBlock(node.thenStatement) &&
            node.thenStatement.statements.some(s => ts.isReturnStatement(s)))
        ) {
          currentFunc.hasReturned = true;
        }
      }

      // Check if a hook is called after an early return
      if (ts.isCallExpression(node)) {
        const text = node.expression.getText(sourceFile);
        if (HOOK_REGEX.test(text)) {
          if (currentFunc.hasReturned) {
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(
              node.getStart(sourceFile)
            );
            errors.push({
              file: filePath,
              line: line + 1,
              col: character + 1,
              func: currentFunc.name,
              hook: text,
              message: `Hook '${text}' called after an early return in component '${currentFunc.name}'`,
            });
          }
        }
      }
    }

    ts.forEachChild(node, child => visit(child, currentFunc));
  }

  visit(sourceFile);
  return errors;
}

const filesToCheck = [
  'app/desktop-workspace.tsx',
  'components/AuditorSummaryView.tsx',
  'app/desktop-main.tsx',
];

let totalErrors = 0;
for (const f of filesToCheck) {
  if (fs.existsSync(f)) {
    const errs = checkFile(f);
    if (errs.length > 0) {
      console.error(`❌ Rules of Hooks violation in ${f}:`);
      errs.forEach(e => {
        console.error(`   Line ${e.line}:${e.col} - ${e.message}`);
      });
      totalErrors += errs.length;
    }
  }
}

if (totalErrors === 0) {
  console.log('✔ All React component hook orders verified valid! No hooks called after early returns.');
  process.exit(0);
} else {
  console.error(`Found ${totalErrors} hook order violations!`);
  process.exit(1);
}
