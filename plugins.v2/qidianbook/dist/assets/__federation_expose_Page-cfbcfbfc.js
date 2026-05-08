import { importShared } from './__federation_fn_import-842fe906.js';
import { _ as _export_sfc } from './_plugin-vue_export-helper-c4c0bc37.js';

const Page_vue_vue_type_style_index_0_scoped_10d901c0_lang = '';

const {createTextVNode:_createTextVNode,resolveComponent:_resolveComponent,withCtx:_withCtx,createVNode:_createVNode,createElementVNode:_createElementVNode,toDisplayString:_toDisplayString,withKeys:_withKeys,renderList:_renderList,Fragment:_Fragment,openBlock:_openBlock,createElementBlock:_createElementBlock,createBlock:_createBlock,createCommentVNode:_createCommentVNode} = await importShared('vue');


const _hoisted_1 = { class: "d-flex align-center" };
const _hoisted_2 = { key: 0 };
const _hoisted_3 = { class: "text-caption text-medium-emphasis mb-1" };
const _hoisted_4 = { class: "text-caption text-medium-emphasis mb-1" };
const _hoisted_5 = { class: "text-caption text-medium-emphasis mb-1" };
const _hoisted_6 = { class: "text-caption text-medium-emphasis" };
const _hoisted_7 = { class: "text-body-2" };
const _hoisted_8 = { class: "mt-2" };
const _hoisted_9 = {
  key: 0,
  class: "mt-3"
};
const _hoisted_10 = { class: "text-caption" };
const _hoisted_11 = { class: "text-caption" };

const {ref,onMounted} = await importShared('vue');



const _sfc_main = {
  __name: 'Page',
  props: {
  api: {
    type: Object,
    default: () => ({})
  }
},
  emits: ['action', 'switch', 'close'],
  setup(__props, { emit: __emit }) {

const props = __props;

// 调试信息
console.log('[QidianBook Page] ========== 组件加载 ==========');
console.log('[QidianBook Page] Props:', props);

// 搜索相关
const searchKeyword = ref('');
const books = ref([]);
const isLoading = ref(false);
const searched = ref(false);

// 图书详情
const detailDialog = ref(false);
const selectedBook = ref(null);

// 认证相关
const showLoginDialog = ref(false);
const cookieInput = ref('');
const isLoggingIn = ref(false);
const isLoggingOut = ref(false);
const loginMessage = ref('');
const loginMessageType = ref('info');
const authStatus = ref({
  logged_in: false,
  username: null,
  cookie_valid: false,
  last_login: null
});

// 加载认证状态
async function loadAuthStatus() {
  try {
    const response = await props.api.get('plugin/QidianBook/auth/status');
    if (response.code === 200) {
      authStatus.value = response.data;
    }
  } catch (error) {
    console.error('加载认证状态失败:', error);
  }
}

// 登录
async function handleLogin() {
  if (!cookieInput.value.trim()) {
    loginMessage.value = '请输入Cookie';
    loginMessageType.value = 'error';
    return
  }

  isLoggingIn.value = true;
  loginMessage.value = '';

  try {
    const response = await props.api.post('plugin/QidianBook/auth/login', {
      cookie: cookieInput.value
    });

    if (response.code === 200) {
      loginMessage.value = '登录成功！';
      loginMessageType.value = 'success';
      await loadAuthStatus();
      setTimeout(() => {
        showLoginDialog.value = false;
        loginMessage.value = '';
      }, 1500);
    } else {
      loginMessage.value = response.message || '登录失败';
      loginMessageType.value = 'error';
    }
  } catch (error) {
    console.error('登录出错:', error);
    loginMessage.value = '登录失败: ' + (error instanceof Error ? error.message : '未知错误');
    loginMessageType.value = 'error';
  } finally {
    isLoggingIn.value = false;
  }
}

// 登出
async function handleLogout() {
  isLoggingOut.value = true;
  loginMessage.value = '';

  try {
    const response = await props.api.post('plugin/QidianBook/auth/logout');

    if (response.code === 200) {
      loginMessage.value = '已登出';
      loginMessageType.value = 'success';
      await loadAuthStatus();
      cookieInput.value = '';
      setTimeout(() => {
        showLoginDialog.value = false;
        loginMessage.value = '';
      }, 1500);
    } else {
      loginMessage.value = response.message || '登出失败';
      loginMessageType.value = 'error';
    }
  } catch (error) {
    console.error('登出出错:', error);
    loginMessage.value = '登出失败: ' + (error instanceof Error ? error.message : '未知错误');
    loginMessageType.value = 'error';
  } finally {
    isLoggingOut.value = false;
  }
}

// 搜索图书
async function handleSearch() {
  if (!searchKeyword.value.trim()) {
    return
  }

  isLoading.value = true;
  searched.value = true;
  books.value = [];

  try {
    const response = await props.api.get('plugin/QidianBook/search', {
      params: {
        keyword: searchKeyword.value,
        page: 1
      }
    });

    if (response.code === 200) {
      books.value = response.data?.books || [];
    } else {
      console.error('搜索失败:', response.message);
    }
  } catch (error) {
    console.error('搜索出错:', error);
  } finally {
    isLoading.value = false;
  }
}

// 显示图书详情
function showBookDetail(book) {
  selectedBook.value = book;
  detailDialog.value = true;
}

// 组件挂载时加载认证状态
onMounted(() => {
  loadAuthStatus();
});

return (_ctx, _cache) => {
  const _component_v_icon = _resolveComponent("v-icon");
  const _component_v_btn = _resolveComponent("v-btn");
  const _component_v_card_title = _resolveComponent("v-card-title");
  const _component_v_divider = _resolveComponent("v-divider");
  const _component_v_text_field = _resolveComponent("v-text-field");
  const _component_v_col = _resolveComponent("v-col");
  const _component_v_row = _resolveComponent("v-row");
  const _component_v_subheader = _resolveComponent("v-subheader");
  const _component_v_img = _resolveComponent("v-img");
  const _component_v_card_text = _resolveComponent("v-card-text");
  const _component_v_card = _resolveComponent("v-card");
  const _component_v_empty_state = _resolveComponent("v-empty-state");
  const _component_v_list_item_title = _resolveComponent("v-list-item-title");
  const _component_v_list_item_subtitle = _resolveComponent("v-list-item-subtitle");
  const _component_v_list_item = _resolveComponent("v-list-item");
  const _component_v_list = _resolveComponent("v-list");
  const _component_v_chip = _resolveComponent("v-chip");
  const _component_v_spacer = _resolveComponent("v-spacer");
  const _component_v_card_actions = _resolveComponent("v-card-actions");
  const _component_v_dialog = _resolveComponent("v-dialog");
  const _component_v_alert = _resolveComponent("v-alert");
  const _component_v_textarea = _resolveComponent("v-textarea");
  const _component_v_container = _resolveComponent("v-container");

  return (_openBlock(), _createBlock(_component_v_container, {
    class: "fill-height",
    fluid: ""
  }, {
    default: _withCtx(() => [
      _createVNode(_component_v_row, {
        justify: "center",
        align: "center"
      }, {
        default: _withCtx(() => [
          _createVNode(_component_v_col, {
            cols: "12",
            md: "10",
            lg: "8"
          }, {
            default: _withCtx(() => [
              _createVNode(_component_v_card, { elevation: "2" }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_card_title, { class: "text-h5 pa-4 d-flex align-center justify-space-between" }, {
                    default: _withCtx(() => [
                      _createElementVNode("div", _hoisted_1, [
                        _createVNode(_component_v_icon, {
                          start: "",
                          color: "primary",
                          size: "large"
                        }, {
                          default: _withCtx(() => [...(_cache[7] || (_cache[7] = [
                            _createTextVNode("mdi-book-search", -1)
                          ]))]),
                          _: 1
                        }),
                        _cache[8] || (_cache[8] = _createElementVNode("span", { class: "ml-2" }, "起点图书搜索", -1))
                      ]),
                      _createVNode(_component_v_btn, {
                        icon: "",
                        variant: "text",
                        onClick: _cache[0] || (_cache[0] = $event => (showLoginDialog.value = true)),
                        title: authStatus.value.logged_in ? '已登录' : '点击登录'
                      }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_icon, {
                            color: authStatus.value.logged_in ? 'success' : 'grey'
                          }, {
                            default: _withCtx(() => [
                              _createTextVNode(_toDisplayString(authStatus.value.logged_in ? 'mdi-account-check' : 'mdi-account'), 1)
                            ]),
                            _: 1
                          }, 8, ["color"])
                        ]),
                        _: 1
                      }, 8, ["title"])
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_divider),
                  _createVNode(_component_v_card_text, { class: "pa-4" }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_row, { class: "mb-4" }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_col, {
                            cols: "12",
                            md: "8"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_text_field, {
                                modelValue: searchKeyword.value,
                                "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((searchKeyword).value = $event)),
                                label: "搜索图书",
                                "prepend-inner-icon": "mdi-magnify",
                                placeholder: "输入书名、作者或关键词",
                                clearable: "",
                                onKeyup: _withKeys(handleSearch, ["enter"])
                              }, null, 8, ["modelValue"])
                            ]),
                            _: 1
                          }),
                          _createVNode(_component_v_col, {
                            cols: "12",
                            md: "4"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_btn, {
                                color: "primary",
                                size: "large",
                                block: "",
                                loading: isLoading.value,
                                onClick: handleSearch
                              }, {
                                default: _withCtx(() => [...(_cache[9] || (_cache[9] = [
                                  _createTextVNode(" 搜索 ", -1)
                                ]))]),
                                _: 1
                              }, 8, ["loading"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      (books.value.length > 0)
                        ? (_openBlock(), _createElementBlock("div", _hoisted_2, [
                            _createVNode(_component_v_subheader, { class: "px-0" }, {
                              default: _withCtx(() => [
                                _createVNode(_component_v_icon, { start: "" }, {
                                  default: _withCtx(() => [...(_cache[10] || (_cache[10] = [
                                    _createTextVNode("mdi-bookshelf", -1)
                                  ]))]),
                                  _: 1
                                }),
                                _createTextVNode(" 搜索结果 (" + _toDisplayString(books.value.length) + "本) ", 1)
                              ]),
                              _: 1
                            }),
                            _createVNode(_component_v_row, null, {
                              default: _withCtx(() => [
                                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(books.value, (book) => {
                                  return (_openBlock(), _createBlock(_component_v_col, {
                                    key: book.id,
                                    cols: "12",
                                    sm: "6",
                                    md: "4"
                                  }, {
                                    default: _withCtx(() => [
                                      _createVNode(_component_v_card, {
                                        hover: "",
                                        elevation: "2",
                                        onClick: $event => (showBookDetail(book))
                                      }, {
                                        default: _withCtx(() => [
                                          _createVNode(_component_v_img, {
                                            src: book.cover || '/logo.png',
                                            height: "200",
                                            cover: "",
                                            class: "align-end text-white"
                                          }, {
                                            default: _withCtx(() => [
                                              _createVNode(_component_v_card_title, { class: "text-subtitle-1" }, {
                                                default: _withCtx(() => [
                                                  _createTextVNode(_toDisplayString(book.title), 1)
                                                ]),
                                                _: 2
                                              }, 1024)
                                            ]),
                                            _: 2
                                          }, 1032, ["src"]),
                                          _createVNode(_component_v_card_text, { class: "py-2" }, {
                                            default: _withCtx(() => [
                                              _createElementVNode("div", _hoisted_3, [
                                                _createVNode(_component_v_icon, {
                                                  size: "small",
                                                  start: ""
                                                }, {
                                                  default: _withCtx(() => [...(_cache[11] || (_cache[11] = [
                                                    _createTextVNode("mdi-account", -1)
                                                  ]))]),
                                                  _: 1
                                                }),
                                                _createTextVNode(" " + _toDisplayString(book.author), 1)
                                              ]),
                                              _createElementVNode("div", _hoisted_4, [
                                                _createVNode(_component_v_icon, {
                                                  size: "small",
                                                  start: ""
                                                }, {
                                                  default: _withCtx(() => [...(_cache[12] || (_cache[12] = [
                                                    _createTextVNode("mdi-tag", -1)
                                                  ]))]),
                                                  _: 1
                                                }),
                                                _createTextVNode(" " + _toDisplayString(book.category), 1)
                                              ]),
                                              _createElementVNode("div", _hoisted_5, [
                                                _createVNode(_component_v_icon, {
                                                  size: "small",
                                                  start: ""
                                                }, {
                                                  default: _withCtx(() => [...(_cache[13] || (_cache[13] = [
                                                    _createTextVNode("mdi-star", -1)
                                                  ]))]),
                                                  _: 1
                                                }),
                                                _createTextVNode(" 评分: " + _toDisplayString(book.rating), 1)
                                              ]),
                                              _createElementVNode("div", _hoisted_6, [
                                                _createVNode(_component_v_icon, {
                                                  size: "small",
                                                  start: ""
                                                }, {
                                                  default: _withCtx(() => [...(_cache[14] || (_cache[14] = [
                                                    _createTextVNode("mdi-file-document", -1)
                                                  ]))]),
                                                  _: 1
                                                }),
                                                _createTextVNode(" " + _toDisplayString(book.word_count) + " | " + _toDisplayString(book.status), 1)
                                              ])
                                            ]),
                                            _: 2
                                          }, 1024)
                                        ]),
                                        _: 2
                                      }, 1032, ["onClick"])
                                    ]),
                                    _: 2
                                  }, 1024))
                                }), 128))
                              ]),
                              _: 1
                            })
                          ]))
                        : (!isLoading.value && searched.value)
                          ? (_openBlock(), _createBlock(_component_v_empty_state, {
                              key: 1,
                              title: "未找到相关图书",
                              text: "请尝试其他关键词",
                              icon: "mdi-book-off"
                            }))
                          : (!isLoading.value && !searched.value)
                            ? (_openBlock(), _createBlock(_component_v_empty_state, {
                                key: 2,
                                title: "搜索起点图书",
                                text: "输入关键词开始搜索",
                                icon: "mdi-book-search"
                              }))
                            : _createCommentVNode("", true)
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
      }),
      _createVNode(_component_v_dialog, {
        modelValue: detailDialog.value,
        "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => ((detailDialog).value = $event)),
        "max-width": "800"
      }, {
        default: _withCtx(() => [
          (selectedBook.value)
            ? (_openBlock(), _createBlock(_component_v_card, { key: 0 }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_card_title, { class: "text-h5 pa-4" }, {
                    default: _withCtx(() => [
                      _createTextVNode(_toDisplayString(selectedBook.value.title), 1)
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_card_text, { class: "pa-4" }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_row, null, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_col, {
                            cols: "12",
                            md: "4"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_img, {
                                src: selectedBook.value.cover || '/logo.png',
                                "aspect-ratio": "0.7",
                                cover: "",
                                class: "rounded-lg"
                              }, null, 8, ["src"])
                            ]),
                            _: 1
                          }),
                          _createVNode(_component_v_col, {
                            cols: "12",
                            md: "8"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_list, { density: "compact" }, {
                                default: _withCtx(() => [
                                  _createVNode(_component_v_list_item, null, {
                                    prepend: _withCtx(() => [
                                      _createVNode(_component_v_icon, { color: "primary" }, {
                                        default: _withCtx(() => [...(_cache[15] || (_cache[15] = [
                                          _createTextVNode("mdi-account", -1)
                                        ]))]),
                                        _: 1
                                      })
                                    ]),
                                    default: _withCtx(() => [
                                      _createVNode(_component_v_list_item_title, null, {
                                        default: _withCtx(() => [...(_cache[16] || (_cache[16] = [
                                          _createTextVNode("作者", -1)
                                        ]))]),
                                        _: 1
                                      }),
                                      _createVNode(_component_v_list_item_subtitle, null, {
                                        default: _withCtx(() => [
                                          _createTextVNode(_toDisplayString(selectedBook.value.author), 1)
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  _createVNode(_component_v_list_item, null, {
                                    prepend: _withCtx(() => [
                                      _createVNode(_component_v_icon, { color: "primary" }, {
                                        default: _withCtx(() => [...(_cache[17] || (_cache[17] = [
                                          _createTextVNode("mdi-tag", -1)
                                        ]))]),
                                        _: 1
                                      })
                                    ]),
                                    default: _withCtx(() => [
                                      _createVNode(_component_v_list_item_title, null, {
                                        default: _withCtx(() => [...(_cache[18] || (_cache[18] = [
                                          _createTextVNode("分类", -1)
                                        ]))]),
                                        _: 1
                                      }),
                                      _createVNode(_component_v_list_item_subtitle, null, {
                                        default: _withCtx(() => [
                                          _createTextVNode(_toDisplayString(selectedBook.value.category), 1)
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  _createVNode(_component_v_list_item, null, {
                                    prepend: _withCtx(() => [
                                      _createVNode(_component_v_icon, { color: "primary" }, {
                                        default: _withCtx(() => [...(_cache[19] || (_cache[19] = [
                                          _createTextVNode("mdi-star", -1)
                                        ]))]),
                                        _: 1
                                      })
                                    ]),
                                    default: _withCtx(() => [
                                      _createVNode(_component_v_list_item_title, null, {
                                        default: _withCtx(() => [...(_cache[20] || (_cache[20] = [
                                          _createTextVNode("评分", -1)
                                        ]))]),
                                        _: 1
                                      }),
                                      _createVNode(_component_v_list_item_subtitle, null, {
                                        default: _withCtx(() => [
                                          _createTextVNode(_toDisplayString(selectedBook.value.rating), 1)
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  _createVNode(_component_v_list_item, null, {
                                    prepend: _withCtx(() => [
                                      _createVNode(_component_v_icon, { color: "primary" }, {
                                        default: _withCtx(() => [...(_cache[21] || (_cache[21] = [
                                          _createTextVNode("mdi-file-document", -1)
                                        ]))]),
                                        _: 1
                                      })
                                    ]),
                                    default: _withCtx(() => [
                                      _createVNode(_component_v_list_item_title, null, {
                                        default: _withCtx(() => [...(_cache[22] || (_cache[22] = [
                                          _createTextVNode("字数", -1)
                                        ]))]),
                                        _: 1
                                      }),
                                      _createVNode(_component_v_list_item_subtitle, null, {
                                        default: _withCtx(() => [
                                          _createTextVNode(_toDisplayString(selectedBook.value.word_count), 1)
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }),
                                  _createVNode(_component_v_list_item, null, {
                                    prepend: _withCtx(() => [
                                      _createVNode(_component_v_icon, { color: "primary" }, {
                                        default: _withCtx(() => [...(_cache[23] || (_cache[23] = [
                                          _createTextVNode("mdi-clock-outline", -1)
                                        ]))]),
                                        _: 1
                                      })
                                    ]),
                                    default: _withCtx(() => [
                                      _createVNode(_component_v_list_item_title, null, {
                                        default: _withCtx(() => [...(_cache[24] || (_cache[24] = [
                                          _createTextVNode("状态", -1)
                                        ]))]),
                                        _: 1
                                      }),
                                      _createVNode(_component_v_list_item_subtitle, null, {
                                        default: _withCtx(() => [
                                          _createTextVNode(_toDisplayString(selectedBook.value.status), 1)
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              _createVNode(_component_v_divider, { class: "my-3" }),
                              _createElementVNode("div", _hoisted_7, [
                                _cache[25] || (_cache[25] = _createElementVNode("strong", null, "简介：", -1)),
                                _createElementVNode("p", _hoisted_8, _toDisplayString(selectedBook.value.description), 1)
                              ]),
                              (selectedBook.value.tags && selectedBook.value.tags.length > 0)
                                ? (_openBlock(), _createElementBlock("div", _hoisted_9, [
                                    _cache[26] || (_cache[26] = _createElementVNode("strong", null, "标签：", -1)),
                                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(selectedBook.value.tags, (tag) => {
                                      return (_openBlock(), _createBlock(_component_v_chip, {
                                        key: tag,
                                        size: "small",
                                        class: "ma-1"
                                      }, {
                                        default: _withCtx(() => [
                                          _createTextVNode(_toDisplayString(tag), 1)
                                        ]),
                                        _: 2
                                      }, 1024))
                                    }), 128))
                                  ]))
                                : _createCommentVNode("", true)
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_card_actions, { class: "pa-4" }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_spacer),
                      _createVNode(_component_v_btn, {
                        color: "grey",
                        variant: "text",
                        onClick: _cache[2] || (_cache[2] = $event => (detailDialog.value = false))
                      }, {
                        default: _withCtx(() => [...(_cache[27] || (_cache[27] = [
                          _createTextVNode(" 关闭 ", -1)
                        ]))]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }))
            : _createCommentVNode("", true)
        ]),
        _: 1
      }, 8, ["modelValue"]),
      _createVNode(_component_v_dialog, {
        modelValue: showLoginDialog.value,
        "onUpdate:modelValue": _cache[6] || (_cache[6] = $event => ((showLoginDialog).value = $event)),
        "max-width": "500"
      }, {
        default: _withCtx(() => [
          _createVNode(_component_v_card, null, {
            default: _withCtx(() => [
              _createVNode(_component_v_card_title, { class: "text-h5 pa-4" }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_icon, {
                    start: "",
                    color: "primary"
                  }, {
                    default: _withCtx(() => [...(_cache[28] || (_cache[28] = [
                      _createTextVNode("mdi-login", -1)
                    ]))]),
                    _: 1
                  }),
                  _cache[29] || (_cache[29] = _createTextVNode(" 起点登录 ", -1))
                ]),
                _: 1
              }),
              _createVNode(_component_v_card_text, { class: "pa-4" }, {
                default: _withCtx(() => [
                  (authStatus.value.logged_in)
                    ? (_openBlock(), _createBlock(_component_v_alert, {
                        key: 0,
                        type: "success",
                        variant: "tonal",
                        class: "mb-4"
                      }, {
                        default: _withCtx(() => [
                          _cache[30] || (_cache[30] = _createElementVNode("div", null, "当前已登录", -1)),
                          _createElementVNode("div", _hoisted_10, "用户: " + _toDisplayString(authStatus.value.username), 1),
                          _createElementVNode("div", _hoisted_11, "最后登录: " + _toDisplayString(authStatus.value.last_login), 1)
                        ]),
                        _: 1
                      }))
                    : _createCommentVNode("", true),
                  _createVNode(_component_v_textarea, {
                    modelValue: cookieInput.value,
                    "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => ((cookieInput).value = $event)),
                    label: "Cookie",
                    placeholder: "请粘贴起点网站的Cookie...",
                    rows: "5",
                    "auto-grow": "",
                    hint: "从浏览器开发者工具中复制Cookie",
                    "persistent-hint": ""
                  }, null, 8, ["modelValue"]),
                  (loginMessage.value)
                    ? (_openBlock(), _createBlock(_component_v_alert, {
                        key: 1,
                        type: loginMessageType.value,
                        variant: "tonal",
                        class: "mt-3"
                      }, {
                        default: _withCtx(() => [
                          _createTextVNode(_toDisplayString(loginMessage.value), 1)
                        ]),
                        _: 1
                      }, 8, ["type"]))
                    : _createCommentVNode("", true)
                ]),
                _: 1
              }),
              _createVNode(_component_v_card_actions, { class: "pa-4" }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_spacer),
                  (authStatus.value.logged_in)
                    ? (_openBlock(), _createBlock(_component_v_btn, {
                        key: 0,
                        color: "error",
                        variant: "outlined",
                        loading: isLoggingOut.value,
                        onClick: handleLogout
                      }, {
                        default: _withCtx(() => [...(_cache[31] || (_cache[31] = [
                          _createTextVNode(" 登出 ", -1)
                        ]))]),
                        _: 1
                      }, 8, ["loading"]))
                    : _createCommentVNode("", true),
                  _createVNode(_component_v_btn, {
                    color: "primary",
                    loading: isLoggingIn.value,
                    onClick: handleLogin
                  }, {
                    default: _withCtx(() => [
                      _createTextVNode(_toDisplayString(authStatus.value.logged_in ? '更新Cookie' : '登录'), 1)
                    ]),
                    _: 1
                  }, 8, ["loading"]),
                  _createVNode(_component_v_btn, {
                    variant: "text",
                    onClick: _cache[5] || (_cache[5] = $event => (showLoginDialog.value = false))
                  }, {
                    default: _withCtx(() => [...(_cache[32] || (_cache[32] = [
                      _createTextVNode(" 取消 ", -1)
                    ]))]),
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
      }, 8, ["modelValue"])
    ]),
    _: 1
  }))
}
}

};
const Page = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-10d901c0"]]);

export { Page as default };
