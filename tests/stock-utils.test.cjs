const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadModule(filePath) {
    const source = fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
    const code = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    }).outputText;
    const exports = {};
    const context = { exports, require, Array, Object, String, Number, Boolean, JSON, Math };
    vm.runInNewContext(code, context);
    return exports;
}

const { isProductInStock, sortProductsByStock } = loadModule('src/lib/stock-utils.ts');

test('isProductInStock handles simple products', () => {
    assert.equal(isProductInStock({ stock: 5 }), true);
    assert.equal(isProductInStock({ stock: 1 }), true);
    assert.equal(isProductInStock({ stock: 0 }), false);
    assert.equal(isProductInStock({ stock: -1 }), false);
    assert.equal(isProductInStock({ stock: null }), false);
    assert.equal(isProductInStock({ stock: undefined }), false);
    assert.equal(isProductInStock(null), false);
});

test('isProductInStock handles variable products', () => {
    // Variable product with variations having stock
    const inStockVariable = {
        isVariablePrice: true,
        stock: 0, // aggregate field 0 but variation has stock
        variations: {
            standard: { label: 'רגיל', price: 100, stock: 0 },
            medium: { label: 'בינוני', price: 150, stock: 3 },
            large: { label: 'גדול', price: 200, stock: 0 },
        }
    };
    assert.equal(isProductInStock(inStockVariable), true);

    // Variable product with variations having string stock
    const inStockWithString = {
        isVariablePrice: true,
        variations: {
            standard: { label: 'רגיל', price: 100, stock: '5' }
        }
    };
    assert.equal(isProductInStock(inStockWithString), true);

    // Variable product all variations 0 stock
    const outOfStockVariable = {
        isVariablePrice: true,
        stock: 5, // Even if aggregate stock was not reset, variations are 0
        variations: {
            standard: { label: 'רגיל', price: 100, stock: 0 },
            medium: { label: 'בינוני', price: 150, stock: 0 }
        }
    };
    assert.equal(isProductInStock(outOfStockVariable), false);

    // Variable product with stringified JSON variations
    const stringifiedJsonVariations = {
        isVariablePrice: true,
        variations: JSON.stringify({
            medium: { label: 'בינוני', price: 150, stock: 2 }
        })
    };
    assert.equal(isProductInStock(stringifiedJsonVariations), true);
});

test('sortProductsByStock places in-stock products first and preserves order within groups', () => {
    const products = [
        { id: '1', name: 'זר אדום (אזל)', stock: 0, order: 1 },
        { id: '2', name: 'זר לבן (במלאי)', stock: 5, order: 2 },
        { id: '3', name: 'זר צהוב (אזל)', stock: 0, order: 3 },
        { id: '4', name: 'זר ורוד (במלאי)', stock: 2, order: 4 },
        { id: '5', name: 'זר סגול (במלאי משתנה)', isVariablePrice: true, variations: { s: { stock: 1 } }, order: 5 },
        { id: '6', name: 'זר כתום (אזל משתנה)', isVariablePrice: true, variations: { s: { stock: 0 } }, order: 6 },
    ];

    const sorted = sortProductsByStock(products);

    // IDs of in-stock should be 2, 4, 5
    // IDs of out-of-stock should be 1, 3, 6
    const sortedIds = sorted.map(p => p.id);
    assert.deepEqual(sortedIds, ['2', '4', '5', '1', '3', '6']);

    // Ensure original array was not mutated (pure function)
    assert.equal(products[0].id, '1');
});

test('sortProductsByStock handles empty or already-sorted arrays', () => {
    assert.deepEqual(sortProductsByStock([]), []);
    const allInStock = [{ id: 'a', stock: 1 }, { id: 'b', stock: 2 }];
    assert.deepEqual(sortProductsByStock(allInStock).map(p => p.id), ['a', 'b']);

    const allOutOfStock = [{ id: 'x', stock: 0 }, { id: 'y', stock: 0 }];
    assert.deepEqual(sortProductsByStock(allOutOfStock).map(p => p.id), ['x', 'y']);
});
