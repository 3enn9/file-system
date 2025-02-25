/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./static/api/fileService.ts":
/*!***********************************!*\
  !*** ./static/api/fileService.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports) {

eval("\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.fetchFiles = fetchFiles;\nfunction fetchFiles(root, sort, signal) {\n    return __awaiter(this, void 0, void 0, function* () {\n        const response = yield fetch(`/api/fs?root=${encodeURIComponent(root)}&sort=${sort}`, { signal });\n        if (!response.ok) {\n            throw new Error('Ошибка при загрузке данных');\n        }\n        return response.json();\n    });\n}\n\n\n//# sourceURL=webpack://fs-sort/./static/api/fileService.ts?");

/***/ }),

/***/ "./static/app.ts":
/*!***********************!*\
  !*** ./static/app.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\n// src/app.ts\nconst updateTable_1 = __webpack_require__(/*! ./utils/updateTable */ \"./static/utils/updateTable.ts\"); // Импортируем функцию обновления таблицы\n// Инициализация\ndocument.addEventListener(\"DOMContentLoaded\", updateTable_1.updateTable);\nconst sortAscButton = document.querySelector(\".button--sort-asc\");\nconst sortDescButton = document.querySelector(\".button--sort-desc\");\nconst backButton = document.querySelector(\".button--back\");\nconst statisticsButton = document.querySelector(\".button--statistics\");\n// Добавляем обработчики для кнопок сортировки\nif (sortAscButton && sortDescButton && backButton && statisticsButton) {\n    sortAscButton.addEventListener(\"click\", function () {\n        const params = new URLSearchParams(window.location.search);\n        let root = params.get(\"root\") || \"/\"; // Получаем актуальный root из URL\n        history.pushState({ root: root }, \"\", `?root=${encodeURIComponent(root)}&sort=asc`);\n        (0, updateTable_1.updateTable)();\n    });\n    sortDescButton.addEventListener(\"click\", function () {\n        const params = new URLSearchParams(window.location.search);\n        let root = params.get(\"root\") || \"/\"; // Получаем актуальный root из URL\n        history.pushState({ root: root }, \"\", `?root=${encodeURIComponent(root)}&sort=desc`);\n        (0, updateTable_1.updateTable)();\n    });\n    // Кнопка назад\n    backButton.addEventListener(\"click\", function () {\n        const params = new URLSearchParams(window.location.search);\n        let root = params.get(\"root\") || \"/\";\n        let newRoot = root.split(\"/\").slice(0, -1).join(\"/\");\n        if (newRoot === \"\") {\n            newRoot = \"/\";\n        }\n        history.pushState({ root: newRoot }, \"\", `?root=${encodeURIComponent(newRoot)}&sort=desc`);\n        (0, updateTable_1.updateTable)();\n    });\n    // Кнопка статистики\n    statisticsButton.addEventListener(\"click\", function () {\n        window.location.href = \"http://localhost/read_stat.php\";\n    });\n}\n\n\n//# sourceURL=webpack://fs-sort/./static/app.ts?");

/***/ }),

/***/ "./static/components/fileGrid.ts":
/*!***************************************!*\
  !*** ./static/components/fileGrid.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.renderTable = renderTable;\nconst urlHelper_1 = __webpack_require__(/*! ../utils/urlHelper */ \"./static/utils/urlHelper.ts\");\nconst updateTable_1 = __webpack_require__(/*! ../utils/updateTable */ \"./static/utils/updateTable.ts\");\nfunction renderTable(files, root) {\n    const container = document.querySelector(\".file-grid\") || null;\n    const pathUrl = document.querySelector(\".current-path\") || null;\n    if (!container) {\n        console.error(\"File grid container not found.\");\n        return;\n    }\n    container.innerHTML = \"\";\n    pathUrl.innerHTML = `Путь ${root}`;\n    files.forEach((file) => {\n        const row = document.createElement(\"div\");\n        row.classList.add(\"file-grid__row\");\n        row.innerHTML = `\n            <div class=\"file-grid__cell\">${file.category}</div>\n            <div class=\"file-grid__cell ${file.category === \"d\" ? \"folder\" : \"\"}\" data-name=\"${file.name}\">${file.name}</div>\n            <div class=\"file-grid__cell\">${file.weight}</div>\n            <div class=\"file-grid__cell\">${file.weight_name}</div>\n        `;\n        if (file.category === \"d\") {\n            row.addEventListener(\"click\", function () {\n                const newRoot = root.endsWith(\"/\") ? root + file.name : root + \"/\" + file.name;\n                (0, urlHelper_1.updateUrl)(newRoot, \"desc\");\n                (0, updateTable_1.updateTable)();\n            });\n            row.style.cursor = \"pointer\";\n        }\n        else {\n            row.style.cursor = \"default\";\n        }\n        container.appendChild(row);\n    });\n}\n\n\n//# sourceURL=webpack://fs-sort/./static/components/fileGrid.ts?");

/***/ }),

/***/ "./static/components/loader.ts":
/*!*************************************!*\
  !*** ./static/components/loader.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.showLoader = showLoader;\nexports.hideLoader = hideLoader;\n// src/components/loader.ts\nfunction showLoader(loader) {\n    if (loader) {\n        loader.style.display = \"block\";\n    }\n}\nfunction hideLoader(loader) {\n    if (loader) {\n        loader.style.display = \"none\";\n    }\n}\n\n\n//# sourceURL=webpack://fs-sort/./static/components/loader.ts?");

/***/ }),

/***/ "./static/utils/updateTable.ts":
/*!*************************************!*\
  !*** ./static/utils/updateTable.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.updateTable = updateTable;\n// src/updateTable.ts\nconst fileService_1 = __webpack_require__(/*! ../api/fileService */ \"./static/api/fileService.ts\");\nconst fileGrid_1 = __webpack_require__(/*! ../components/fileGrid */ \"./static/components/fileGrid.ts\");\nconst loader_1 = __webpack_require__(/*! ../components/loader */ \"./static/components/loader.ts\");\nconst urlHelper_1 = __webpack_require__(/*! ./urlHelper */ \"./static/utils/urlHelper.ts\");\nlet controller = null;\nfunction updateTable() {\n    if (controller) {\n        controller.abort();\n    }\n    controller = new AbortController();\n    const signal = controller.signal;\n    const loader = document.getElementById(\"loader\");\n    const fileGrid = document.querySelector(\".file-grid\");\n    let root = (0, urlHelper_1.getRootFromUrl)();\n    let sort = (0, urlHelper_1.getSortFromUrl)();\n    const buttons = document.querySelectorAll(\".button\");\n    buttons.forEach((button) => button.disabled = true);\n    (0, loader_1.showLoader)(loader);\n    if (fileGrid)\n        fileGrid.classList.add(\"hidden\");\n    (0, fileService_1.fetchFiles)(root, sort, signal)\n        .then((data) => {\n        (0, fileGrid_1.renderTable)(data, root);\n    })\n        .catch((error) => {\n        if (error.name !== \"AbortError\") {\n            console.error(\"Ошибка в запросе\", error);\n        }\n    })\n        .finally(() => {\n        buttons.forEach((button) => button.disabled = false);\n        (0, loader_1.hideLoader)(loader);\n        if (fileGrid)\n            fileGrid.classList.remove(\"hidden\");\n    });\n}\n\n\n//# sourceURL=webpack://fs-sort/./static/utils/updateTable.ts?");

/***/ }),

/***/ "./static/utils/urlHelper.ts":
/*!***********************************!*\
  !*** ./static/utils/urlHelper.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.getRootFromUrl = getRootFromUrl;\nexports.getSortFromUrl = getSortFromUrl;\nexports.updateUrl = updateUrl;\n// src/utils/urlHelper.ts\nfunction getRootFromUrl() {\n    const params = new URLSearchParams(window.location.search);\n    return params.get(\"root\") || \"/\";\n}\nfunction getSortFromUrl() {\n    const params = new URLSearchParams(window.location.search);\n    return params.get(\"sort\") || \"desc\";\n}\nfunction updateUrl(newRoot, sort) {\n    history.pushState({ root: newRoot }, \"\", `?root=${encodeURIComponent(newRoot)}&sort=${sort}`);\n}\n\n\n//# sourceURL=webpack://fs-sort/./static/utils/urlHelper.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./static/app.ts");
/******/ 	
/******/ })()
;