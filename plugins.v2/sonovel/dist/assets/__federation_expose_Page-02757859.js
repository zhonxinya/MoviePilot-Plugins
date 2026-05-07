import { importShared } from './__federation_fn_import-e338e0b1.js';
import { _ as _export_sfc, N as NOTIFICATION_ICONS, a as NOTIFICATION_COLORS, U as UI_CONSTANTS } from './constants-b97608de.js';

const SearchHeader_vue_vue_type_style_index_0_scoped_73de42b8_lang = '';

const {createElementVNode:_createElementVNode$4,resolveComponent:_resolveComponent$7,createVNode:_createVNode$7,withCtx:_withCtx$7,createTextVNode:_createTextVNode$5,toDisplayString:_toDisplayString$4,openBlock:_openBlock$7,createBlock:_createBlock$6,createCommentVNode:_createCommentVNode$5,withKeys:_withKeys} = await importShared('vue');


const {ref: ref$1} = await importShared('vue');



const _sfc_main$7 = {
  __name: 'SearchHeader',
  props: {
  searchKeyword: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
},
  emits: ['search', 'update:searchKeyword'],
  setup(__props, { emit: __emit }) {

const props = __props;

const emit = __emit;

// 本地搜索关键词
const localKeyword = ref$1(props.searchKeyword);

// 执行搜索
function handleSearch() {
  emit('search', localKeyword.value);
}

// 同步父组件的 keyword 变化
function syncKeyword(value) {
  localKeyword.value = value;
  emit('update:searchKeyword', value);
}

// 关闭按钮
function handleClose() {
  emit('close');
}

return (_ctx, _cache) => {
  const _component_v_icon = _resolveComponent$7("v-icon");
  const _component_v_avatar = _resolveComponent$7("v-avatar");
  const _component_v_card_title = _resolveComponent$7("v-card-title");
  const _component_v_btn = _resolveComponent$7("v-btn");
  const _component_v_card_item = _resolveComponent$7("v-card-item");
  const _component_v_alert = _resolveComponent$7("v-alert");
  const _component_v_text_field = _resolveComponent$7("v-text-field");
  const _component_v_col = _resolveComponent$7("v-col");
  const _component_v_row = _resolveComponent$7("v-row");
  const _component_v_card_text = _resolveComponent$7("v-card-text");
  const _component_v_card = _resolveComponent$7("v-card");

  return (_openBlock$7(), _createBlock$6(_component_v_card, {
    class: "mb-6 search-header-card",
    elevation: "8"
  }, {
    default: _withCtx$7(() => [
      _cache[4] || (_cache[4] = _createElementVNode$4("div", { class: "header-gradient-bg" }, null, -1)),
      _cache[5] || (_cache[5] = _createElementVNode$4("div", { class: "header-particles" }, null, -1)),
      _createVNode$7(_component_v_card_item, {
        class: "position-relative",
        style: {"z-index":"1"}
      }, {
        append: _withCtx$7(() => [
          _createVNode$7(_component_v_btn, {
            icon: "",
            color: "white",
            variant: "text",
            onClick: handleClose,
            class: "close-btn"
          }, {
            default: _withCtx$7(() => [
              _createVNode$7(_component_v_icon, null, {
                default: _withCtx$7(() => [...(_cache[1] || (_cache[1] = [
                  _createTextVNode$5("mdi-close", -1)
                ]))]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        default: _withCtx$7(() => [
          _createVNode$7(_component_v_card_title, { class: "d-flex align-center py-4" }, {
            default: _withCtx$7(() => [
              _createVNode$7(_component_v_avatar, {
                size: "56",
                color: "white",
                class: "mr-3 elevation-6 pulse-animation"
              }, {
                default: _withCtx$7(() => [
                  _createVNode$7(_component_v_icon, {
                    icon: "mdi-book-search",
                    size: "30",
                    color: "primary"
                  })
                ]),
                _: 1
              }),
              _cache[0] || (_cache[0] = _createElementVNode$4("div", null, [
                _createElementVNode$4("span", { class: "text-h4 font-weight-black text-white d-block letter-spacing-tight" }, "SoNovel 图书搜索"),
                _createElementVNode$4("span", { class: "text-subtitle-2 text-white-opacity mt-1 d-block" }, "聚合多书源 · 一键搜索海量电子书")
              ], -1))
            ]),
            _: 1
          })
        ]),
        _: 1
      }),
      _createVNode$7(_component_v_card_text, { class: "position-relative pt-2 pb-4" }, {
        default: _withCtx$7(() => [
          (__props.error)
            ? (_openBlock$7(), _createBlock$6(_component_v_alert, {
                key: 0,
                type: "error",
                variant: "tonal",
                density: "compact",
                class: "mb-4",
                border: "start"
              }, {
                default: _withCtx$7(() => [
                  _createVNode$7(_component_v_icon, { start: "" }, {
                    default: _withCtx$7(() => [...(_cache[2] || (_cache[2] = [
                      _createTextVNode$5("mdi-alert-circle-outline", -1)
                    ]))]),
                    _: 1
                  }),
                  _createTextVNode$5(" " + _toDisplayString$4(__props.error), 1)
                ]),
                _: 1
              }))
            : _createCommentVNode$5("", true),
          _createVNode$7(_component_v_row, null, {
            default: _withCtx$7(() => [
              _createVNode$7(_component_v_col, {
                cols: "12",
                md: "9"
              }, {
                default: _withCtx$7(() => [
                  _createVNode$7(_component_v_text_field, {
                    "model-value": localKeyword.value,
                    label: "搜索关键词",
                    placeholder: "请输入书名、作者或关键词...",
                    "prepend-inner-icon": "mdi-magnify",
                    clearable: "",
                    variant: "solo-filled",
                    density: "comfortable",
                    "bg-color": "rgba(255, 255, 255, 0.95)",
                    "onUpdate:modelValue": syncKeyword,
                    onKeyup: _withKeys(handleSearch, ["enter"]),
                    "hide-details": "",
                    class: "search-field glow-effect"
                  }, null, 8, ["model-value"])
                ]),
                _: 1
              }),
              _createVNode$7(_component_v_col, {
                cols: "12",
                md: "3"
              }, {
                default: _withCtx$7(() => [
                  _createVNode$7(_component_v_btn, {
                    color: "white",
                    size: "x-large",
                    block: "",
                    "prepend-icon": "mdi-search-web",
                    loading: __props.isLoading,
                    onClick: handleSearch,
                    elevation: "6",
                    class: "search-action-btn text-primary font-weight-bold shimmer-effect"
                  }, {
                    default: _withCtx$7(() => [...(_cache[3] || (_cache[3] = [
                      _createTextVNode$5(" 开始搜索 ", -1)
                    ]))]),
                    _: 1
                  }, 8, ["loading"])
                ]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      })
    ]),
    _: 1
  }))
}
}

};
const SearchHeader = /*#__PURE__*/_export_sfc(_sfc_main$7, [['__scopeId',"data-v-73de42b8"]]);

const TabNavigation_vue_vue_type_style_index_0_scoped_fec86524_lang = '';

const {resolveComponent:_resolveComponent$6,openBlock:_openBlock$6,createBlock:_createBlock$5,createCommentVNode:_createCommentVNode$4,createTextVNode:_createTextVNode$4,withCtx:_withCtx$6,createVNode:_createVNode$6} = await importShared('vue');



const _sfc_main$6 = {
  __name: 'TabNavigation',
  props: {
  currentTab: {
    type: String,
    required: true
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  historyCount: {
    type: Number,
    default: 0
  }
},
  emits: ['update:currentTab'],
  setup(__props, { emit: __emit }) {

const emit = __emit;

// 更新标签页
function updateTab(value) {
  emit('update:currentTab', value);
}

return (_ctx, _cache) => {
  const _component_v_badge = _resolveComponent$6("v-badge");
  const _component_v_tab = _resolveComponent$6("v-tab");
  const _component_v_tabs = _resolveComponent$6("v-tabs");
  const _component_v_card = _resolveComponent$6("v-card");

  return (_openBlock$6(), _createBlock$5(_component_v_card, {
    class: "mb-6 tab-navigation-card",
    elevation: "6"
  }, {
    default: _withCtx$6(() => [
      _createVNode$6(_component_v_tabs, {
        "model-value": __props.currentTab,
        color: "primary",
        centered: "",
        "bg-color": "transparent",
        class: "tab-navigation",
        "onUpdate:modelValue": updateTab
      }, {
        default: _withCtx$6(() => [
          _createVNode$6(_component_v_tab, {
            value: "search",
            "prepend-icon": "mdi-magnify"
          }, {
            default: _withCtx$6(() => [
              _cache[0] || (_cache[0] = _createTextVNode$4(" 搜索结果 ", -1)),
              (__props.resultsCount > 0)
                ? (_openBlock$6(), _createBlock$5(_component_v_badge, {
                    key: 0,
                    content: __props.resultsCount,
                    inline: "",
                    color: "success",
                    size: "small"
                  }, null, 8, ["content"]))
                : _createCommentVNode$4("", true)
            ]),
            _: 1
          }),
          _createVNode$6(_component_v_tab, {
            value: "history",
            "prepend-icon": "mdi-history"
          }, {
            default: _withCtx$6(() => [
              _cache[1] || (_cache[1] = _createTextVNode$4(" 搜索历史 ", -1)),
              (__props.historyCount > 0)
                ? (_openBlock$6(), _createBlock$5(_component_v_badge, {
                    key: 0,
                    content: __props.historyCount,
                    inline: "",
                    color: "info",
                    size: "small"
                  }, null, 8, ["content"]))
                : _createCommentVNode$4("", true)
            ]),
            _: 1
          }),
          _createVNode$6(_component_v_tab, {
            value: "cache",
            "prepend-icon": "mdi-database"
          }, {
            default: _withCtx$6(() => [...(_cache[2] || (_cache[2] = [
              _createTextVNode$4(" 缓存管理 ", -1)
            ]))]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["model-value"])
    ]),
    _: 1
  }))
}
}

};
const TabNavigation = /*#__PURE__*/_export_sfc(_sfc_main$6, [['__scopeId',"data-v-fec86524"]]);

const BookCard_vue_vue_type_style_index_0_scoped_766efea1_lang = '';

const {resolveComponent:_resolveComponent$5,openBlock:_openBlock$5,createBlock:_createBlock$4,createCommentVNode:_createCommentVNode$3,createTextVNode:_createTextVNode$3,withCtx:_withCtx$5,createVNode:_createVNode$5,createElementBlock:_createElementBlock$4,toDisplayString:_toDisplayString$3,createElementVNode:_createElementVNode$3} = await importShared('vue');


const _hoisted_1$5 = { class: "cover-wrapper" };
const _hoisted_2$3 = {
  key: 1,
  class: "no-cover-placeholder animated-gradient"
};
const _hoisted_3$3 = { class: "source-badge glass-badge" };
const _hoisted_4$2 = { class: "text-body-2 font-weight-medium" };
const _hoisted_5$2 = { class: "mb-3 d-flex align-center justify-space-between" };
const _hoisted_6$2 = { class: "text-caption d-flex align-center category-tag" };
const _hoisted_7$1 = {
  key: 0,
  class: "text-caption d-flex align-center pa-2 rounded-lg bg-primary-lighten-5 chapter-info mb-2"
};
const _hoisted_8$1 = { class: "text-truncate font-weight-medium" };
const _hoisted_9$1 = {
  key: 1,
  class: "text-caption d-flex align-center mb-2 update-time-info"
};
const _hoisted_10 = { class: "text-grey" };
const _hoisted_11 = {
  key: 2,
  class: "text-caption description-box mb-2"
};
const _hoisted_12 = { class: "description-text" };
const _hoisted_13 = {
  key: 3,
  class: "mt-2 text-caption d-flex align-center multi-source-hint"
};
const _hoisted_14 = { class: "text-info" };


const _sfc_main$5 = {
  __name: 'BookCard',
  props: {
  book: {
    type: Object,
    required: true
  }
},
  emits: ['download'],
  setup(__props, { emit: __emit }) {

// 格式化更新时间
function formatUpdateTime(timeStr) {
  if (!timeStr) return ''
  
  // 如果是时间戳，转换为日期
  if (/^\d+$/.test(timeStr)) {
    const date = new Date(parseInt(timeStr));
    return date.toLocaleDateString('zh-CN')
  }
  
  // 如果已经是日期字符串，直接返回
  return timeStr
}

// 截断简介文本
function truncateDescription(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

return (_ctx, _cache) => {
  const _component_v_img = _resolveComponent$5("v-img");
  const _component_v_icon = _resolveComponent$5("v-icon");
  const _component_v_avatar = _resolveComponent$5("v-avatar");
  const _component_v_chip = _resolveComponent$5("v-chip");
  const _component_v_card_title = _resolveComponent$5("v-card-title");
  const _component_v_card_subtitle = _resolveComponent$5("v-card-subtitle");
  const _component_v_card_text = _resolveComponent$5("v-card-text");
  const _component_v_divider = _resolveComponent$5("v-divider");
  const _component_v_spacer = _resolveComponent$5("v-spacer");
  const _component_v_btn = _resolveComponent$5("v-btn");
  const _component_v_card_actions = _resolveComponent$5("v-card-actions");
  const _component_v_card = _resolveComponent$5("v-card");

  return (_openBlock$5(), _createBlock$4(_component_v_card, {
    hover: "",
    class: "result-card h-100",
    elevation: "4"
  }, {
    default: _withCtx$5(() => [
      _createElementVNode$3("div", _hoisted_1$5, [
        (__props.book.coverUrl)
          ? (_openBlock$5(), _createBlock$4(_component_v_img, {
              key: 0,
              src: __props.book.coverUrl,
              height: "240",
              cover: "",
              class: "gradient-overlay zoom-on-hover",
              "lazy-src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 140'%3E%3Crect fill='%23f0f0f0' width='100' height='140'/%3E%3Ctext x='50' y='70' font-family='Arial' font-size='12' fill='%23999' text-anchor='middle'%3E加载中...%3C/text%3E%3C/svg%3E",
              transition: "fade-transition"
            }, null, 8, ["src"]))
          : (_openBlock$5(), _createElementBlock$4("div", _hoisted_2$3, [
              _createVNode$5(_component_v_avatar, {
                size: "80",
                color: "white",
                class: "elevation-6 bounce-animation"
              }, {
                default: _withCtx$5(() => [
                  _createVNode$5(_component_v_icon, {
                    size: "40",
                    color: "primary"
                  }, {
                    default: _withCtx$5(() => [...(_cache[1] || (_cache[1] = [
                      _createTextVNode$3("mdi-book-outline", -1)
                    ]))]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ])),
        _createElementVNode$3("div", _hoisted_3$3, [
          (!__props.book.sources || __props.book.sources.length === 0)
            ? (_openBlock$5(), _createBlock$4(_component_v_chip, {
                key: 0,
                size: "small",
                color: "white",
                variant: "flat",
                "prepend-icon": "mdi-book-open-page-variant",
                class: "font-weight-medium"
              }, {
                default: _withCtx$5(() => [
                  _createTextVNode$3(_toDisplayString$3(__props.book.sourceName), 1)
                ]),
                _: 1
              }))
            : (_openBlock$5(), _createBlock$4(_component_v_chip, {
                key: 1,
                size: "small",
                color: "amber",
                variant: "flat",
                "prepend-icon": "mdi-link-variant",
                class: "font-weight-medium"
              }, {
                default: _withCtx$5(() => [
                  _createTextVNode$3(_toDisplayString$3(__props.book.sources.length + 1) + " 个书源 ", 1)
                ]),
                _: 1
              }))
        ])
      ]),
      _createVNode$5(_component_v_card_title, { class: "text-subtitle-1 font-weight-bold text-truncate-2 py-3 px-4" }, {
        default: _withCtx$5(() => [
          _createTextVNode$3(_toDisplayString$3(__props.book.bookName), 1)
        ]),
        _: 1
      }),
      _createVNode$5(_component_v_card_subtitle, { class: "pb-2 d-flex align-center px-4" }, {
        default: _withCtx$5(() => [
          _createVNode$5(_component_v_avatar, {
            size: "22",
            color: "primary",
            variant: "tonal",
            class: "mr-2"
          }, {
            default: _withCtx$5(() => [
              _createVNode$5(_component_v_icon, {
                size: "14",
                color: "primary"
              }, {
                default: _withCtx$5(() => [...(_cache[2] || (_cache[2] = [
                  _createTextVNode$3("mdi-account", -1)
                ]))]),
                _: 1
              })
            ]),
            _: 1
          }),
          _createElementVNode$3("span", _hoisted_4$2, _toDisplayString$3(__props.book.author), 1)
        ]),
        _: 1
      }),
      _createVNode$5(_component_v_card_text, { class: "pt-0 px-4" }, {
        default: _withCtx$5(() => [
          _createElementVNode$3("div", _hoisted_5$2, [
            _createElementVNode$3("div", _hoisted_6$2, [
              _createVNode$5(_component_v_icon, {
                size: "small",
                icon: "mdi-tag-outline",
                color: "secondary",
                class: "mr-1"
              }),
              _createTextVNode$3(" " + _toDisplayString$3(__props.book.category || '未分类'), 1)
            ]),
            (__props.book.status)
              ? (_openBlock$5(), _createBlock$4(_component_v_chip, {
                  key: 0,
                  size: "x-small",
                  color: __props.book.status === '连载中' ? 'warning' : 'success',
                  variant: "tonal",
                  class: "font-weight-medium"
                }, {
                  default: _withCtx$5(() => [
                    _createTextVNode$3(_toDisplayString$3(__props.book.status), 1)
                  ]),
                  _: 1
                }, 8, ["color"]))
              : _createCommentVNode$3("", true)
          ]),
          (__props.book.latestChapter)
            ? (_openBlock$5(), _createElementBlock$4("div", _hoisted_7$1, [
                _createVNode$5(_component_v_icon, {
                  size: "small",
                  icon: "mdi-newspaper-variant-outline",
                  color: "primary",
                  class: "mr-2"
                }),
                _createElementVNode$3("span", _hoisted_8$1, _toDisplayString$3(__props.book.latestChapter), 1)
              ]))
            : _createCommentVNode$3("", true),
          (__props.book.lastUpdateTime)
            ? (_openBlock$5(), _createElementBlock$4("div", _hoisted_9$1, [
                _createVNode$5(_component_v_icon, {
                  size: "x-small",
                  icon: "mdi-clock-outline",
                  color: "grey",
                  class: "mr-1"
                }),
                _createElementVNode$3("span", _hoisted_10, "更新于: " + _toDisplayString$3(formatUpdateTime(__props.book.lastUpdateTime)), 1)
              ]))
            : _createCommentVNode$3("", true),
          (__props.book.description)
            ? (_openBlock$5(), _createElementBlock$4("div", _hoisted_11, [
                _createVNode$5(_component_v_icon, {
                  size: "x-small",
                  icon: "mdi-text-short",
                  color: "info",
                  class: "mr-1"
                }),
                _createElementVNode$3("span", _hoisted_12, _toDisplayString$3(truncateDescription(__props.book.description, 60)), 1)
              ]))
            : _createCommentVNode$3("", true),
          (__props.book.sources && __props.book.sources.length > 0)
            ? (_openBlock$5(), _createElementBlock$4("div", _hoisted_13, [
                _createVNode$5(_component_v_icon, {
                  size: "x-small",
                  icon: "mdi-information-outline",
                  color: "info",
                  class: "mr-1"
                }),
                _createElementVNode$3("span", _hoisted_14, "来自 " + _toDisplayString$3(__props.book.sources.length + 1) + " 个不同书源", 1)
              ]))
            : _createCommentVNode$3("", true)
        ]),
        _: 1
      }),
      _createVNode$5(_component_v_divider, { class: "mx-4" }),
      _createVNode$5(_component_v_card_actions, { class: "px-4 py-3" }, {
        default: _withCtx$5(() => [
          _createVNode$5(_component_v_spacer),
          _createVNode$5(_component_v_btn, {
            size: "default",
            color: "primary",
            variant: "flat",
            "prepend-icon": "mdi-download-circle",
            onClick: _cache[0] || (_cache[0] = $event => (_ctx.$emit('download', __props.book))),
            block: "",
            elevation: "3",
            class: "download-action-btn font-weight-bold"
          }, {
            default: _withCtx$5(() => [...(_cache[3] || (_cache[3] = [
              _createTextVNode$3(" 下载电子书 ", -1)
            ]))]),
            _: 1
          })
        ]),
        _: 1
      })
    ]),
    _: 1
  }))
}
}

};
const BookCard = /*#__PURE__*/_export_sfc(_sfc_main$5, [['__scopeId',"data-v-766efea1"]]);

const ResultsList_vue_vue_type_style_index_0_scoped_5b248e35_lang = '';

const {resolveComponent:_resolveComponent$4,createVNode:_createVNode$4,withCtx:_withCtx$4,createElementVNode:_createElementVNode$2,toDisplayString:_toDisplayString$2,createTextVNode:_createTextVNode$2,renderList:_renderList$2,Fragment:_Fragment$2,openBlock:_openBlock$4,createElementBlock:_createElementBlock$3,normalizeStyle:_normalizeStyle,createBlock:_createBlock$3,createCommentVNode:_createCommentVNode$2} = await importShared('vue');


const _hoisted_1$4 = { class: "d-flex align-center" };
const _hoisted_2$2 = { class: "text-subtitle-2 text-white-opacity" };
const _hoisted_3$2 = {
  key: 0,
  class: "text-center mt-8"
};


const _sfc_main$4 = {
  __name: 'ResultsList',
  props: {
  results: {
    type: Array,
    required: true
  },
  displayedResults: {
    type: Array,
    required: true
  },
  hasMoreResults: {
    type: Boolean,
    default: false
  },
  remainingCount: {
    type: Number,
    default: 0
  },
  isLoadingMore: {
    type: Boolean,
    default: false
  }
},
  emits: ['download', 'clear', 'loadMore'],
  setup(__props, { emit: __emit }) {

const emit = __emit;

// 下载书籍
function handleDownload(book) {
  emit('download', book);
}

// 清空结果
function handleClear() {
  emit('clear');
}

// 加载更多
function handleLoadMore() {
  emit('loadMore');
}

return (_ctx, _cache) => {
  const _component_v_icon = _resolveComponent$4("v-icon");
  const _component_v_avatar = _resolveComponent$4("v-avatar");
  const _component_v_btn = _resolveComponent$4("v-btn");
  const _component_v_card_title = _resolveComponent$4("v-card-title");
  const _component_v_col = _resolveComponent$4("v-col");
  const _component_v_row = _resolveComponent$4("v-row");
  const _component_v_card_text = _resolveComponent$4("v-card-text");
  const _component_v_card = _resolveComponent$4("v-card");

  return (__props.results.length > 0)
    ? (_openBlock$4(), _createBlock$3(_component_v_card, {
        key: 0,
        class: "mb-6 results-container",
        elevation: "6"
      }, {
        default: _withCtx$4(() => [
          _createVNode$4(_component_v_card_title, { class: "d-flex align-center justify-space-between py-4 bg-gradient glass-effect" }, {
            default: _withCtx$4(() => [
              _createElementVNode$2("div", _hoisted_1$4, [
                _createVNode$4(_component_v_avatar, {
                  size: "48",
                  color: "success",
                  class: "mr-3 elevation-4 bounce-in"
                }, {
                  default: _withCtx$4(() => [
                    _createVNode$4(_component_v_icon, {
                      icon: "mdi-format-list-bulleted",
                      size: "26",
                      color: "white"
                    })
                  ]),
                  _: 1
                }),
                _createElementVNode$2("div", null, [
                  _cache[0] || (_cache[0] = _createElementVNode$2("span", { class: "text-h5 font-weight-bold text-white d-block" }, "搜索结果", -1)),
                  _createElementVNode$2("span", _hoisted_2$2, " 共找到 " + _toDisplayString$2(__props.results.length) + " 本相关书籍 ", 1)
                ])
              ]),
              _createVNode$4(_component_v_btn, {
                size: "small",
                variant: "outlined",
                color: "white",
                "prepend-icon": "mdi-close",
                onClick: handleClear,
                class: "white--text"
              }, {
                default: _withCtx$4(() => [...(_cache[1] || (_cache[1] = [
                  _createTextVNode$2(" 清空结果 ", -1)
                ]))]),
                _: 1
              })
            ]),
            _: 1
          }),
          _createVNode$4(_component_v_card_text, { class: "pa-5" }, {
            default: _withCtx$4(() => [
              _createVNode$4(_component_v_row, null, {
                default: _withCtx$4(() => [
                  (_openBlock$4(true), _createElementBlock$3(_Fragment$2, null, _renderList$2(__props.displayedResults, (book, index) => {
                    return (_openBlock$4(), _createBlock$3(_component_v_col, {
                      key: book.url,
                      cols: "12",
                      sm: "6",
                      md: "4",
                      lg: "3",
                      class: "animate-fade-in",
                      style: _normalizeStyle({ animationDelay: `${index * 0.05}s` })
                    }, {
                      default: _withCtx$4(() => [
                        _createVNode$4(BookCard, {
                          book: book,
                          onDownload: handleDownload
                        }, null, 8, ["book"])
                      ]),
                      _: 2
                    }, 1032, ["style"]))
                  }), 128))
                ]),
                _: 1
              }),
              (__props.hasMoreResults)
                ? (_openBlock$4(), _createElementBlock$3("div", _hoisted_3$2, [
                    _createVNode$4(_component_v_btn, {
                      color: "primary",
                      variant: "tonal",
                      "prepend-icon": "mdi-dots-horizontal-circle",
                      loading: __props.isLoadingMore,
                      onClick: handleLoadMore,
                      size: "x-large",
                      elevation: "4",
                      class: "load-more-btn"
                    }, {
                      default: _withCtx$4(() => [
                        _createTextVNode$2(" 加载更多 (" + _toDisplayString$2(__props.remainingCount) + " 条) ", 1)
                      ]),
                      _: 1
                    }, 8, ["loading"])
                  ]))
                : _createCommentVNode$2("", true)
            ]),
            _: 1
          })
        ]),
        _: 1
      }))
    : _createCommentVNode$2("", true)
}
}

};
const ResultsList = /*#__PURE__*/_export_sfc(_sfc_main$4, [['__scopeId',"data-v-5b248e35"]]);

const HistoryList_vue_vue_type_style_index_0_scoped_5484149e_lang = '';

const {resolveComponent:_resolveComponent$3,createVNode:_createVNode$3,withCtx:_withCtx$3,createElementVNode:_createElementVNode$1,createTextVNode:_createTextVNode$1,renderList:_renderList$1,Fragment:_Fragment$1,openBlock:_openBlock$3,createElementBlock:_createElementBlock$2,toDisplayString:_toDisplayString$1,createBlock:_createBlock$2,createCommentVNode:_createCommentVNode$1} = await importShared('vue');


const _hoisted_1$3 = { class: "text-left" };
const _hoisted_2$1 = { class: "text-center" };
const _hoisted_3$1 = { class: "text-right" };
const _hoisted_4$1 = {
  class: "text-center",
  style: {"width":"120px"}
};
const _hoisted_5$1 = { class: "font-weight-medium" };
const _hoisted_6$1 = { class: "text-center" };
const _hoisted_7 = { class: "text-right text-grey" };
const _hoisted_8 = { class: "text-center" };
const _hoisted_9 = { class: "empty-icon-wrapper mb-6" };


const _sfc_main$3 = {
  __name: 'HistoryList',
  props: {
  history: {
    type: Array,
    required: true
  }
},
  emits: ['search', 'delete', 'clearAll'],
  setup(__props, { emit: __emit }) {

const emit = __emit;

// 点击历史记录进行搜索
function handleSearch(keyword) {
  emit('search', keyword);
}

// 删除单条记录
function handleDelete(index) {
  emit('delete', index);
}

// 清空所有历史
function handleClearAll() {
  emit('clearAll');
}

return (_ctx, _cache) => {
  const _component_v_icon = _resolveComponent$3("v-icon");
  const _component_v_avatar = _resolveComponent$3("v-avatar");
  const _component_v_card_title = _resolveComponent$3("v-card-title");
  const _component_v_chip = _resolveComponent$3("v-chip");
  const _component_v_btn = _resolveComponent$3("v-btn");
  const _component_v_table = _resolveComponent$3("v-table");
  const _component_v_card_text = _resolveComponent$3("v-card-text");
  const _component_v_divider = _resolveComponent$3("v-divider");
  const _component_v_spacer = _resolveComponent$3("v-spacer");
  const _component_v_card_actions = _resolveComponent$3("v-card-actions");
  const _component_v_card = _resolveComponent$3("v-card");

  return (_openBlock$3(), _createElementBlock$2("div", null, [
    (__props.history.length > 0)
      ? (_openBlock$3(), _createBlock$2(_component_v_card, {
          key: 0,
          class: "history-card",
          elevation: "6"
        }, {
          default: _withCtx$3(() => [
            _createVNode$3(_component_v_card_title, { class: "d-flex align-center py-4 bg-gradient-secondary" }, {
              default: _withCtx$3(() => [
                _createVNode$3(_component_v_avatar, {
                  size: "44",
                  color: "white",
                  class: "mr-3 elevation-3"
                }, {
                  default: _withCtx$3(() => [
                    _createVNode$3(_component_v_icon, {
                      icon: "mdi-history",
                      size: "24",
                      color: "success"
                    })
                  ]),
                  _: 1
                }),
                _cache[1] || (_cache[1] = _createElementVNode$1("div", null, [
                  _createElementVNode$1("span", { class: "text-h6 font-weight-bold text-white d-block" }, "搜索历史记录"),
                  _createElementVNode$1("span", { class: "text-caption text-white-opacity" }, "查看和管理您的搜索历史")
                ], -1))
              ]),
              _: 1
            }),
            _createVNode$3(_component_v_card_text, { class: "pa-5" }, {
              default: _withCtx$3(() => [
                _createVNode$3(_component_v_table, {
                  hover: "",
                  class: "history-table"
                }, {
                  default: _withCtx$3(() => [
                    _createElementVNode$1("thead", null, [
                      _createElementVNode$1("tr", null, [
                        _createElementVNode$1("th", _hoisted_1$3, [
                          _createVNode$3(_component_v_icon, {
                            size: "small",
                            class: "mr-1"
                          }, {
                            default: _withCtx$3(() => [...(_cache[2] || (_cache[2] = [
                              _createTextVNode$1("mdi-magnify", -1)
                            ]))]),
                            _: 1
                          }),
                          _cache[3] || (_cache[3] = _createTextVNode$1(" 关键词 ", -1))
                        ]),
                        _createElementVNode$1("th", _hoisted_2$1, [
                          _createVNode$3(_component_v_icon, {
                            size: "small",
                            class: "mr-1"
                          }, {
                            default: _withCtx$3(() => [...(_cache[4] || (_cache[4] = [
                              _createTextVNode$1("mdi-format-list-numbered", -1)
                            ]))]),
                            _: 1
                          }),
                          _cache[5] || (_cache[5] = _createTextVNode$1(" 结果数 ", -1))
                        ]),
                        _createElementVNode$1("th", _hoisted_3$1, [
                          _createVNode$3(_component_v_icon, {
                            size: "small",
                            class: "mr-1"
                          }, {
                            default: _withCtx$3(() => [...(_cache[6] || (_cache[6] = [
                              _createTextVNode$1("mdi-clock-outline", -1)
                            ]))]),
                            _: 1
                          }),
                          _cache[7] || (_cache[7] = _createTextVNode$1(" 时间 ", -1))
                        ]),
                        _createElementVNode$1("th", _hoisted_4$1, [
                          _createVNode$3(_component_v_icon, {
                            size: "small",
                            class: "mr-1"
                          }, {
                            default: _withCtx$3(() => [...(_cache[8] || (_cache[8] = [
                              _createTextVNode$1("mdi-cog", -1)
                            ]))]),
                            _: 1
                          }),
                          _cache[9] || (_cache[9] = _createTextVNode$1(" 操作 ", -1))
                        ])
                      ])
                    ]),
                    _createElementVNode$1("tbody", null, [
                      (_openBlock$3(true), _createElementBlock$2(_Fragment$1, null, _renderList$1(__props.history, (record, index) => {
                        return (_openBlock$3(), _createElementBlock$2("tr", {
                          key: index,
                          class: "history-row"
                        }, [
                          _createElementVNode$1("td", _hoisted_5$1, [
                            _createVNode$3(_component_v_chip, {
                              size: "small",
                              color: "primary",
                              variant: "tonal",
                              onClick: $event => (handleSearch(record.keyword)),
                              class: "cursor-pointer"
                            }, {
                              default: _withCtx$3(() => [
                                _createTextVNode$1(_toDisplayString$1(record.keyword), 1)
                              ]),
                              _: 2
                            }, 1032, ["onClick"])
                          ]),
                          _createElementVNode$1("td", _hoisted_6$1, [
                            _createVNode$3(_component_v_chip, {
                              size: "small",
                              color: "primary",
                              variant: "tonal"
                            }, {
                              default: _withCtx$3(() => [
                                _createTextVNode$1(_toDisplayString$1(record.count), 1)
                              ]),
                              _: 2
                            }, 1024)
                          ]),
                          _createElementVNode$1("td", _hoisted_7, _toDisplayString$1(record.timestamp), 1),
                          _createElementVNode$1("td", _hoisted_8, [
                            _createVNode$3(_component_v_btn, {
                              size: "x-small",
                              variant: "text",
                              color: "error",
                              icon: "mdi-delete",
                              onClick: $event => (handleDelete(index))
                            }, null, 8, ["onClick"])
                          ])
                        ]))
                      }), 128))
                    ])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }),
            _createVNode$3(_component_v_divider),
            _createVNode$3(_component_v_card_actions, { class: "pa-4" }, {
              default: _withCtx$3(() => [
                _createVNode$3(_component_v_spacer),
                _createVNode$3(_component_v_btn, {
                  color: "error",
                  variant: "outlined",
                  "prepend-icon": "mdi-delete-sweep",
                  onClick: handleClearAll,
                  elevation: "2"
                }, {
                  default: _withCtx$3(() => [...(_cache[10] || (_cache[10] = [
                    _createTextVNode$1(" 清空全部历史 ", -1)
                  ]))]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          _: 1
        }))
      : (_openBlock$3(), _createBlock$2(_component_v_card, {
          key: 1,
          class: "empty-state-card",
          elevation: "4"
        }, {
          default: _withCtx$3(() => [
            _createVNode$3(_component_v_card_text, { class: "text-center py-16" }, {
              default: _withCtx$3(() => [
                _createElementVNode$1("div", _hoisted_9, [
                  _createVNode$3(_component_v_icon, {
                    size: "80",
                    color: "grey-lighten-2",
                    class: "floating-animation"
                  }, {
                    default: _withCtx$3(() => [...(_cache[11] || (_cache[11] = [
                      _createTextVNode$1("mdi-history-remove", -1)
                    ]))]),
                    _: 1
                  })
                ]),
                _cache[13] || (_cache[13] = _createElementVNode$1("h3", { class: "text-h4 mb-4 font-weight-bold text-grey-darken-2" }, "暂无搜索历史", -1)),
                _cache[14] || (_cache[14] = _createElementVNode$1("p", { class: "text-body-1 text-grey-darken-1 mb-6" }, "开始搜索后，历史记录将显示在这里", -1)),
                _createVNode$3(_component_v_btn, {
                  color: "primary",
                  variant: "flat",
                  "prepend-icon": "mdi-arrow-up-bold",
                  size: "large",
                  elevation: "4",
                  onClick: _cache[0] || (_cache[0] = $event => (_ctx.$emit('goToSearch'))),
                  class: "cta-button"
                }, {
                  default: _withCtx$3(() => [...(_cache[12] || (_cache[12] = [
                    _createTextVNode$1(" 去搜索 ", -1)
                  ]))]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          _: 1
        }))
  ]))
}
}

};
const HistoryList = /*#__PURE__*/_export_sfc(_sfc_main$3, [['__scopeId',"data-v-5484149e"]]);

const CacheManager_vue_vue_type_style_index_0_scoped_c1b2fb6f_lang = '';

const {resolveComponent:_resolveComponent$2,createVNode:_createVNode$2,withCtx:_withCtx$2,createElementVNode:_createElementVNode,openBlock:_openBlock$2,createBlock:_createBlock$1,createCommentVNode:_createCommentVNode,createTextVNode:_createTextVNode,toDisplayString:_toDisplayString} = await importShared('vue');


const _hoisted_1$2 = { class: "d-flex align-center mb-3" };
const _hoisted_2 = { class: "text-h4 font-weight-bold text-primary" };
const _hoisted_3 = { class: "d-flex align-center mb-3" };
const _hoisted_4 = { class: "text-h4 font-weight-bold text-success" };
const _hoisted_5 = { class: "d-flex align-center mb-3" };
const _hoisted_6 = { class: "text-h4 font-weight-bold text-info" };


const _sfc_main$2 = {
  __name: 'CacheManager',
  props: {
  cacheStatus: {
    type: Object,
    default: null
  },
  isLoadingCache: {
    type: Boolean,
    default: false
  }
},
  emits: ['refresh', 'clear'],
  setup(__props, { emit: __emit }) {

const emit = __emit;

// 格式化 TTL 时间
function formatTTL(seconds) {
  if (!seconds) return 'N/A'
  
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分钟`
  } else {
    return `${Math.floor(seconds / 3600)}小时`
  }
}

// 刷新缓存状态
function handleRefresh() {
  emit('refresh');
}

// 清空缓存
function handleClear() {
  emit('clear');
}

return (_ctx, _cache) => {
  const _component_v_icon = _resolveComponent$2("v-icon");
  const _component_v_avatar = _resolveComponent$2("v-avatar");
  const _component_v_card_title = _resolveComponent$2("v-card-title");
  const _component_v_progress_linear = _resolveComponent$2("v-progress-linear");
  const _component_v_divider = _resolveComponent$2("v-divider");
  const _component_v_card_text = _resolveComponent$2("v-card-text");
  const _component_v_card = _resolveComponent$2("v-card");
  const _component_v_col = _resolveComponent$2("v-col");
  const _component_v_row = _resolveComponent$2("v-row");
  const _component_v_alert = _resolveComponent$2("v-alert");
  const _component_v_spacer = _resolveComponent$2("v-spacer");
  const _component_v_btn = _resolveComponent$2("v-btn");
  const _component_v_card_actions = _resolveComponent$2("v-card-actions");

  return (_openBlock$2(), _createBlock$1(_component_v_card, {
    class: "cache-card",
    elevation: "6"
  }, {
    default: _withCtx$2(() => [
      _createVNode$2(_component_v_card_title, { class: "d-flex align-center py-4 bg-gradient-cache" }, {
        default: _withCtx$2(() => [
          _createVNode$2(_component_v_avatar, {
            size: "44",
            color: "white",
            class: "mr-3 elevation-3"
          }, {
            default: _withCtx$2(() => [
              _createVNode$2(_component_v_icon, {
                icon: "mdi-database",
                size: "24",
                color: "purple"
              })
            ]),
            _: 1
          }),
          _cache[0] || (_cache[0] = _createElementVNode("div", null, [
            _createElementVNode("span", { class: "text-h6 font-weight-bold text-white d-block" }, "缓存管理"),
            _createElementVNode("span", { class: "text-caption text-white-opacity" }, "优化性能和存储空间")
          ], -1))
        ]),
        _: 1
      }),
      _createVNode$2(_component_v_card_text, { class: "pa-5" }, {
        default: _withCtx$2(() => [
          (__props.isLoadingCache)
            ? (_openBlock$2(), _createBlock$1(_component_v_progress_linear, {
                key: 0,
                indeterminate: "",
                color: "primary",
                class: "mb-4"
              }))
            : _createCommentVNode("", true),
          (__props.cacheStatus)
            ? (_openBlock$2(), _createBlock$1(_component_v_row, { key: 1 }, {
                default: _withCtx$2(() => [
                  _createVNode$2(_component_v_col, {
                    cols: "12",
                    md: "4"
                  }, {
                    default: _withCtx$2(() => [
                      _createVNode$2(_component_v_card, {
                        variant: "outlined",
                        class: "cache-stat-card"
                      }, {
                        default: _withCtx$2(() => [
                          _createVNode$2(_component_v_card_text, null, {
                            default: _withCtx$2(() => [
                              _createElementVNode("div", _hoisted_1$2, [
                                _createVNode$2(_component_v_icon, {
                                  size: "32",
                                  color: "primary",
                                  class: "mr-3"
                                }, {
                                  default: _withCtx$2(() => [...(_cache[1] || (_cache[1] = [
                                    _createTextVNode("mdi-database-check", -1)
                                  ]))]),
                                  _: 1
                                }),
                                _createElementVNode("div", null, [
                                  _cache[2] || (_cache[2] = _createElementVNode("div", { class: "text-caption text-grey" }, "缓存条目数", -1)),
                                  _createElementVNode("div", _hoisted_2, _toDisplayString(__props.cacheStatus.cache_size || 0), 1)
                                ])
                              ]),
                              _createVNode$2(_component_v_divider, { class: "my-3" }),
                              _cache[3] || (_cache[3] = _createElementVNode("div", { class: "text-body-2 text-grey" }, " 已缓存的搜索关键词数量 ", -1))
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  _createVNode$2(_component_v_col, {
                    cols: "12",
                    md: "4"
                  }, {
                    default: _withCtx$2(() => [
                      _createVNode$2(_component_v_card, {
                        variant: "outlined",
                        class: "cache-stat-card"
                      }, {
                        default: _withCtx$2(() => [
                          _createVNode$2(_component_v_card_text, null, {
                            default: _withCtx$2(() => [
                              _createElementVNode("div", _hoisted_3, [
                                _createVNode$2(_component_v_icon, {
                                  size: "32",
                                  color: "success",
                                  class: "mr-3"
                                }, {
                                  default: _withCtx$2(() => [...(_cache[4] || (_cache[4] = [
                                    _createTextVNode("mdi-memory", -1)
                                  ]))]),
                                  _: 1
                                }),
                                _createElementVNode("div", null, [
                                  _cache[5] || (_cache[5] = _createElementVNode("div", { class: "text-caption text-grey" }, "内存使用", -1)),
                                  _createElementVNode("div", _hoisted_4, _toDisplayString(__props.cacheStatus.memory_usage || 'N/A'), 1)
                                ])
                              ]),
                              _createVNode$2(_component_v_divider, { class: "my-3" }),
                              _cache[6] || (_cache[6] = _createElementVNode("div", { class: "text-body-2 text-grey" }, " 当前内存中的缓存数据 ", -1))
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  _createVNode$2(_component_v_col, {
                    cols: "12",
                    md: "4"
                  }, {
                    default: _withCtx$2(() => [
                      _createVNode$2(_component_v_card, {
                        variant: "outlined",
                        class: "cache-stat-card"
                      }, {
                        default: _withCtx$2(() => [
                          _createVNode$2(_component_v_card_text, null, {
                            default: _withCtx$2(() => [
                              _createElementVNode("div", _hoisted_5, [
                                _createVNode$2(_component_v_icon, {
                                  size: "32",
                                  color: "info",
                                  class: "mr-3"
                                }, {
                                  default: _withCtx$2(() => [...(_cache[7] || (_cache[7] = [
                                    _createTextVNode("mdi-clock-outline", -1)
                                  ]))]),
                                  _: 1
                                }),
                                _createElementVNode("div", null, [
                                  _cache[8] || (_cache[8] = _createElementVNode("div", { class: "text-caption text-grey" }, "缓存有效期", -1)),
                                  _createElementVNode("div", _hoisted_6, _toDisplayString(formatTTL(__props.cacheStatus.cache_ttl)), 1)
                                ])
                              ]),
                              _createVNode$2(_component_v_divider, { class: "my-3" }),
                              _cache[9] || (_cache[9] = _createElementVNode("div", { class: "text-body-2 text-grey" }, " 每条缓存的保存时间 ", -1))
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }))
            : _createCommentVNode("", true),
          _createVNode$2(_component_v_alert, {
            type: "info",
            variant: "tonal",
            density: "comfortable",
            class: "mt-4",
            border: "start"
          }, {
            prepend: _withCtx$2(() => [
              _createVNode$2(_component_v_icon, null, {
                default: _withCtx$2(() => [...(_cache[10] || (_cache[10] = [
                  _createTextVNode("mdi-information-outline", -1)
                ]))]),
                _: 1
              })
            ]),
            default: _withCtx$2(() => [
              _cache[11] || (_cache[11] = _createElementVNode("div", null, [
                _createElementVNode("strong", null, "缓存说明："),
                _createElementVNode("br"),
                _createTextVNode(" • 缓存可以加快重复搜索的速度"),
                _createElementVNode("br"),
                _createTextVNode(" • 缓存数据会在插件重启时自动保存"),
                _createElementVNode("br"),
                _createTextVNode(" • 定期清理过期缓存可释放存储空间 ")
              ], -1))
            ]),
            _: 1
          })
        ]),
        _: 1
      }),
      _createVNode$2(_component_v_divider),
      _createVNode$2(_component_v_card_actions, { class: "pa-4" }, {
        default: _withCtx$2(() => [
          _createVNode$2(_component_v_spacer),
          _createVNode$2(_component_v_btn, {
            color: "primary",
            variant: "flat",
            "prepend-icon": "mdi-refresh",
            onClick: handleRefresh,
            loading: __props.isLoadingCache,
            elevation: "2"
          }, {
            default: _withCtx$2(() => [...(_cache[12] || (_cache[12] = [
              _createTextVNode(" 刷新状态 ", -1)
            ]))]),
            _: 1
          }, 8, ["loading"]),
          _createVNode$2(_component_v_btn, {
            color: "warning",
            variant: "outlined",
            "prepend-icon": "mdi-delete-forever",
            onClick: handleClear,
            loading: __props.isLoadingCache,
            elevation: "2"
          }, {
            default: _withCtx$2(() => [...(_cache[13] || (_cache[13] = [
              _createTextVNode(" 清空缓存 ", -1)
            ]))]),
            _: 1
          }, 8, ["loading"])
        ]),
        _: 1
      })
    ]),
    _: 1
  }))
}
}

};
const CacheManager = /*#__PURE__*/_export_sfc(_sfc_main$2, [['__scopeId',"data-v-c1b2fb6f"]]);

const NotificationContainer_vue_vue_type_style_index_0_scoped_f2f4b717_lang = '';

const {renderList:_renderList,Fragment:_Fragment,openBlock:_openBlock$1,createElementBlock:_createElementBlock$1,resolveComponent:_resolveComponent$1,createVNode:_createVNode$1,withCtx:_withCtx$1,createBlock:_createBlock,TransitionGroup:_TransitionGroup} = await importShared('vue');


const _hoisted_1$1 = { class: "notification-container" };


const _sfc_main$1 = {
  __name: 'NotificationContainer',
  props: {
  notifications: {
    type: Array,
    required: true
  }
},
  emits: ['remove'],
  setup(__props, { emit: __emit }) {

const emit = __emit;

// 获取通知图标
function getNotificationIcon(type) {
  return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.info
}

// 获取通知颜色
function getNotificationColor(type) {
  return NOTIFICATION_COLORS[type] || NOTIFICATION_COLORS.info
}

// 移除通知
function handleRemove(id) {
  emit('remove', id);
}

return (_ctx, _cache) => {
  const _component_v_icon = _resolveComponent$1("v-icon");
  const _component_v_alert = _resolveComponent$1("v-alert");

  return (_openBlock$1(), _createElementBlock$1("div", _hoisted_1$1, [
    _createVNode$1(_TransitionGroup, { name: "notification-slide" }, {
      default: _withCtx$1(() => [
        (_openBlock$1(true), _createElementBlock$1(_Fragment, null, _renderList(__props.notifications, (notification) => {
          return (_openBlock$1(), _createBlock(_component_v_alert, {
            key: notification.id,
            type: getNotificationColor(notification.type),
            title: notification.title,
            text: notification.message,
            closable: "",
            density: "comfortable",
            variant: "tonal",
            border: "start",
            class: "mb-2 notification-alert",
            "onClick:close": $event => (handleRemove(notification.id))
          }, {
            prepend: _withCtx$1(() => [
              _createVNode$1(_component_v_icon, {
                icon: getNotificationIcon(notification.type)
              }, null, 8, ["icon"])
            ]),
            _: 2
          }, 1032, ["type", "title", "text", "onClick:close"]))
        }), 128))
      ]),
      _: 1
    })
  ]))
}
}

};
const NotificationContainer = /*#__PURE__*/_export_sfc(_sfc_main$1, [['__scopeId',"data-v-f2f4b717"]]);

const {defineComponent:_defineComponent} = await importShared('vue');

const {createVNode:_createVNode,resolveComponent:_resolveComponent,withCtx:_withCtx,openBlock:_openBlock,createElementBlock:_createElementBlock} = await importShared('vue');

const _hoisted_1 = { class: "sonovel-page" };
const {ref,onMounted,computed} = await importShared('vue');
const pluginId = "Sonovel";
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "Page",
  props: {
    api: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["action", "switch", "close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    console.log("[SoNovel Page] ========== 组件加载 ==========");
    console.log("[SoNovel Page] Props:", props);
    const searchKeyword = ref("");
    const searchResults = ref([]);
    const isLoading = ref(false);
    const error = ref("");
    const PAGE_SIZE = UI_CONSTANTS.PAGE_SIZE;
    const currentPage = ref(1);
    const isLoadingMore = ref(false);
    const mergedResults = computed(() => {
      const mergedMap = /* @__PURE__ */ new Map();
      searchResults.value.forEach((book) => {
        const key = `${book.bookName}|||${book.author}`;
        if (mergedMap.has(key)) {
          const existing = mergedMap.get(key);
          if (!existing.sources) {
            existing.sources = [existing];
          }
          existing.sources.push(book);
          if (!existing.coverUrl && book.coverUrl) {
            existing.coverUrl = book.coverUrl;
          }
          if (book.latestChapter && (!existing.latestChapter || book.lastUpdateTime > existing.lastUpdateTime)) {
            existing.latestChapter = book.latestChapter;
            existing.lastUpdateTime = book.lastUpdateTime;
          }
        } else {
          mergedMap.set(key, { ...book });
        }
      });
      return Array.from(mergedMap.values());
    });
    const displayedResults = computed(() => {
      return mergedResults.value.slice(0, currentPage.value * PAGE_SIZE);
    });
    const hasMoreResults = computed(() => {
      return displayedResults.value.length < searchResults.value.length;
    });
    const remainingCount = computed(() => {
      return searchResults.value.length - displayedResults.value.length;
    });
    const currentTab = ref("search");
    const cacheStatus = ref(null);
    const isLoadingCache = ref(false);
    const searchHistory = ref([]);
    const notifications = ref([]);
    function showNotification(type, title, message, duration = UI_CONSTANTS.NOTIFICATION_DURATION) {
      const id = Date.now();
      notifications.value.push({ id, type, title, message, duration });
      setTimeout(() => removeNotification(id), duration);
    }
    function removeNotification(id) {
      const index = notifications.value.findIndex((n) => n.id === id);
      if (index !== -1) {
        notifications.value.splice(index, 1);
      }
    }
    async function safeApiCall(apiCall, retries = 2, delay = 1e3) {
      let lastError = null;
      for (let i = 0; i <= retries; i++) {
        try {
          return await apiCall();
        } catch (error2) {
          lastError = error2;
          if (i < retries) {
            await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
            console.warn(`API 调用失败，第 ${i + 1} 次重试...`, error2);
          }
        }
      }
      throw lastError;
    }
    async function handleSearch(keyword) {
      if (!keyword.trim()) {
        error.value = "请输入搜索关键词";
        return;
      }
      searchKeyword.value = keyword;
      isLoading.value = true;
      error.value = "";
      try {
        const response = await safeApiCall(
          () => props.api.get(`plugin/${pluginId}/search?keyword=${encodeURIComponent(keyword)}`)
        );
        if (response.code === 200) {
          searchResults.value = response.data || [];
          saveToSearchHistory(keyword, searchResults.value.length);
          showNotification("success", "搜索成功", `找到 ${searchResults.value.length} 本相关书籍`);
          emit("action");
        } else {
          throw new Error(response.message || "搜索失败");
        }
      } catch (err) {
        console.error("搜索出错:", err);
        error.value = err instanceof Error ? err.message : "未知错误";
      } finally {
        isLoading.value = false;
      }
    }
    async function handleDownload(book) {
      try {
        const downloadData = {
          sourceId: String(book.sourceId),
          sourceName: book.sourceName,
          url: book.url,
          bookName: book.bookName,
          author: book.author,
          category: book.category || void 0,
          latestChapter: book.latestChapter || void 0,
          lastUpdateTime: book.lastUpdateTime || void 0,
          status: book.status || void 0,
          format: "epub",
          language: "zh_CN",
          coverUrl: book.coverUrl || void 0
        };
        const response = await safeApiCall(
          () => props.api.post(`plugin/${pluginId}/download`, downloadData)
        );
        if (response.code === 200) {
          const taskId = response.data?.task_id;
          showNotification("success", "任务已提交", `任务ID: ${taskId}
请在后台查看进度`);
          emit("action");
        } else {
          throw new Error(response.message || "下载失败");
        }
      } catch (err) {
        console.error("下载异常:", err);
        showNotification("error", "下载失败", err instanceof Error ? err.message : "未知错误");
      }
    }
    async function loadSearchHistory() {
      try {
        const historyStr = localStorage.getItem("sonovel_search_history");
        searchHistory.value = historyStr ? JSON.parse(historyStr) : [];
      } catch (err) {
        console.error("加载搜索历史失败:", err);
        searchHistory.value = [];
      }
    }
    function saveToSearchHistory(keyword, count) {
      try {
        const history = JSON.parse(localStorage.getItem("sonovel_search_history") || "[]");
        const existingIndex = history.findIndex((item) => item.keyword === keyword);
        if (existingIndex !== -1) {
          history[existingIndex].count = count;
          history[existingIndex].timestamp = (/* @__PURE__ */ new Date()).toLocaleString("zh-CN");
          const item = history.splice(existingIndex, 1)[0];
          history.unshift(item);
        } else {
          history.unshift({
            keyword,
            count,
            timestamp: (/* @__PURE__ */ new Date()).toLocaleString("zh-CN")
          });
        }
        localStorage.setItem("sonovel_search_history", JSON.stringify(history.slice(0, UI_CONSTANTS.MAX_HISTORY_ITEMS)));
        searchHistory.value = history.slice(0, UI_CONSTANTS.MAX_HISTORY_ITEMS);
      } catch (err) {
        console.error("保存搜索历史失败:", err);
      }
    }
    function clearResults() {
      searchResults.value = [];
      searchKeyword.value = "";
      error.value = "";
      currentPage.value = 1;
    }
    function deleteHistoryRecord(index) {
      try {
        searchHistory.value.splice(index, 1);
        localStorage.setItem("sonovel_search_history", JSON.stringify(searchHistory.value));
        showNotification("success", "已删除", "搜索记录已删除");
      } catch (err) {
        console.error("删除历史记录失败:", err);
      }
    }
    function clearAllHistory() {
      try {
        searchHistory.value = [];
        localStorage.removeItem("sonovel_search_history");
        showNotification("success", "已清空", "所有搜索历史已清空");
      } catch (err) {
        console.error("清空历史记录失败:", err);
      }
    }
    function loadMore() {
      isLoadingMore.value = true;
      setTimeout(() => {
        currentPage.value++;
        isLoadingMore.value = false;
      }, UI_CONSTANTS.LOAD_MORE_DELAY);
    }
    function handleClose() {
      emit("close");
    }
    async function loadCacheStatus() {
      try {
        isLoadingCache.value = true;
        const response = await safeApiCall(
          () => props.api.get(`plugin/${pluginId}/cache_status`)
        );
        if (response.code === 200) {
          cacheStatus.value = response.data;
        }
      } catch (err) {
        console.error("加载缓存状态失败:", err);
      } finally {
        isLoadingCache.value = false;
      }
    }
    async function handleClearCache() {
      try {
        const response = await safeApiCall(
          () => props.api.post(`plugin/${pluginId}/cache/clear`)
        );
        if (response.code === 200) {
          showNotification("success", "缓存已清空", `清除了 ${response.data.cleared_count} 条记录`);
          await loadCacheStatus();
        }
      } catch (err) {
        showNotification("error", "清空缓存失败", err instanceof Error ? err.message : "未知错误");
      }
    }
    onMounted(() => {
      loadSearchHistory();
      loadCacheStatus();
    });
    return (_ctx, _cache) => {
      const _component_v_window_item = _resolveComponent("v-window-item");
      const _component_v_window = _resolveComponent("v-window");
      return _openBlock(), _createElementBlock("div", _hoisted_1, [
        _createVNode(NotificationContainer, {
          notifications: notifications.value,
          onRemove: removeNotification
        }, null, 8, ["notifications"]),
        _createVNode(SearchHeader, {
          "search-keyword": searchKeyword.value,
          "onUpdate:searchKeyword": _cache[0] || (_cache[0] = ($event) => searchKeyword.value = $event),
          "is-loading": isLoading.value,
          error: error.value,
          onSearch: handleSearch,
          onClose: handleClose
        }, null, 8, ["search-keyword", "is-loading", "error"]),
        _createVNode(TabNavigation, {
          "current-tab": currentTab.value,
          "onUpdate:currentTab": _cache[1] || (_cache[1] = ($event) => currentTab.value = $event),
          "results-count": mergedResults.value.length,
          "history-count": searchHistory.value.length
        }, null, 8, ["current-tab", "results-count", "history-count"]),
        _createVNode(_component_v_window, {
          modelValue: currentTab.value,
          "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => currentTab.value = $event)
        }, {
          default: _withCtx(() => [
            _createVNode(_component_v_window_item, { value: "search" }, {
              default: _withCtx(() => [
                _createVNode(ResultsList, {
                  results: mergedResults.value,
                  "displayed-results": displayedResults.value,
                  "has-more-results": hasMoreResults.value,
                  "remaining-count": remainingCount.value,
                  "is-loading-more": isLoadingMore.value,
                  onDownload: handleDownload,
                  onClear: clearResults,
                  onLoadMore: loadMore
                }, null, 8, ["results", "displayed-results", "has-more-results", "remaining-count", "is-loading-more"])
              ]),
              _: 1
            }),
            _createVNode(_component_v_window_item, { value: "history" }, {
              default: _withCtx(() => [
                _createVNode(HistoryList, {
                  history: searchHistory.value,
                  onSearch: _cache[2] || (_cache[2] = (keyword) => {
                    currentTab.value = "search";
                    handleSearch(keyword);
                  }),
                  onDelete: deleteHistoryRecord,
                  onClearAll: clearAllHistory,
                  onGoToSearch: _cache[3] || (_cache[3] = ($event) => currentTab.value = "search")
                }, null, 8, ["history"])
              ]),
              _: 1
            }),
            _createVNode(_component_v_window_item, { value: "cache" }, {
              default: _withCtx(() => [
                _createVNode(CacheManager, {
                  "cache-status": cacheStatus.value,
                  "is-loading-cache": isLoadingCache.value,
                  onRefresh: loadCacheStatus,
                  onClear: handleClearCache
                }, null, 8, ["cache-status", "is-loading-cache"])
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["modelValue"])
      ]);
    };
  }
});

const Page_vue_vue_type_style_index_0_scoped_4a9a5e90_lang = '';

const Page = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-4a9a5e90"]]);

export { Page as default };
