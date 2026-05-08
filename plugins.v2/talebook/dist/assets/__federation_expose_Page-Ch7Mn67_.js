import { importShared } from './__federation_fn_import-JrT3xvdd.js';
import { _ as _export_sfc } from './_plugin-vue_export-helper-pcqpp-6-.js';

const {defineComponent:_defineComponent$6} = await importShared('vue');

const {resolveComponent:_resolveComponent$6,createVNode:_createVNode$6,withCtx:_withCtx$6,renderSlot:_renderSlot$1,toDisplayString:_toDisplayString$5,createTextVNode:_createTextVNode$6,openBlock:_openBlock$6,createBlock:_createBlock$6,createCommentVNode:_createCommentVNode$5} = await importShared('vue');

const _sfc_main$6 = /* @__PURE__ */ _defineComponent$6({
  __name: "BookCard",
  props: {
    book: {},
    coverUrl: {},
    isFavorited: { type: Boolean, default: false },
    isDownloading: { type: Boolean, default: false },
    showFavorite: { type: Boolean, default: true }
  },
  emits: ["detail", "toggle-favorite", "download"],
  setup(__props) {
    return (_ctx, _cache) => {
      const _component_v_progress_circular = _resolveComponent$6("v-progress-circular");
      const _component_v_row = _resolveComponent$6("v-row");
      const _component_v_img = _resolveComponent$6("v-img");
      const _component_v_card_title = _resolveComponent$6("v-card-title");
      const _component_v_card_subtitle = _resolveComponent$6("v-card-subtitle");
      const _component_v_card_item = _resolveComponent$6("v-card-item");
      const _component_v_chip = _resolveComponent$6("v-chip");
      const _component_v_chip_group = _resolveComponent$6("v-chip-group");
      const _component_v_card_text = _resolveComponent$6("v-card-text");
      const _component_v_btn = _resolveComponent$6("v-btn");
      const _component_v_spacer = _resolveComponent$6("v-spacer");
      const _component_v_card_actions = _resolveComponent$6("v-card-actions");
      const _component_v_card = _resolveComponent$6("v-card");
      return _openBlock$6(), _createBlock$6(_component_v_card, {
        hover: "",
        elevation: "3",
        class: "h-100 rounded-lg overflow-hidden",
        style: { "max-width": "280px" }
      }, {
        default: _withCtx$6(() => [
          _createVNode$6(_component_v_img, {
            src: __props.coverUrl,
            height: "280",
            cover: "",
            class: "bg-grey-lighten-3",
            gradient: "to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.2)"
          }, {
            placeholder: _withCtx$6(() => [
              _createVNode$6(_component_v_row, {
                class: "fill-height ma-0",
                align: "center",
                justify: "center"
              }, {
                default: _withCtx$6(() => [
                  _createVNode$6(_component_v_progress_circular, {
                    indeterminate: "",
                    color: "grey-lighten-5"
                  })
                ]),
                _: 1
              })
            ]),
            default: _withCtx$6(() => [
              _renderSlot$1(_ctx.$slots, "badge", { book: __props.book }, void 0, true)
            ]),
            _: 3
          }, 8, ["src"]),
          _createVNode$6(_component_v_card_item, { class: "py-2 px-2" }, {
            default: _withCtx$6(() => [
              _createVNode$6(_component_v_card_title, {
                class: "text-body-2 font-weight-bold line-clamp-2",
                style: { "min-height": "40px" }
              }, {
                default: _withCtx$6(() => [
                  _createTextVNode$6(_toDisplayString$5(__props.book.title), 1)
                ]),
                _: 1
              }),
              _createVNode$6(_component_v_card_subtitle, { class: "text-caption text-blue-accent-4 line-clamp-1 mt-1" }, {
                default: _withCtx$6(() => [
                  _createTextVNode$6(_toDisplayString$5(__props.book.author), 1)
                ]),
                _: 1
              })
            ]),
            _: 1
          }),
          _createVNode$6(_component_v_card_text, { class: "pb-1 px-2" }, {
            default: _withCtx$6(() => [
              _createVNode$6(_component_v_chip_group, {
                column: "",
                density: "compact"
              }, {
                default: _withCtx$6(() => [
                  __props.book.publisher ? (_openBlock$6(), _createBlock$6(_component_v_chip, {
                    key: 0,
                    size: "x-small",
                    variant: "tonal",
                    color: "info",
                    class: "mb-1"
                  }, {
                    default: _withCtx$6(() => [
                      _createTextVNode$6(_toDisplayString$5(__props.book.publisher), 1)
                    ]),
                    _: 1
                  })) : _createCommentVNode$5("", true),
                  __props.book.tag ? (_openBlock$6(), _createBlock$6(_component_v_chip, {
                    key: 1,
                    size: "x-small",
                    variant: "tonal",
                    color: "success"
                  }, {
                    default: _withCtx$6(() => [
                      _createTextVNode$6(_toDisplayString$5(__props.book.tag), 1)
                    ]),
                    _: 1
                  })) : _createCommentVNode$5("", true)
                ]),
                _: 1
              })
            ]),
            _: 1
          }),
          _createVNode$6(_component_v_card_actions, { class: "pb-2 px-2" }, {
            default: _withCtx$6(() => [
              _renderSlot$1(_ctx.$slots, "actions", { book: __props.book }, () => [
                _createVNode$6(_component_v_btn, {
                  size: "x-small",
                  variant: "tonal",
                  color: "primary",
                  "prepend-icon": "mdi-information-outline",
                  onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("detail", __props.book.id))
                }, {
                  default: _withCtx$6(() => [..._cache[3] || (_cache[3] = [
                    _createTextVNode$6(" 详情 ", -1)
                  ])]),
                  _: 1
                }),
                _createVNode$6(_component_v_spacer),
                __props.showFavorite ? (_openBlock$6(), _createBlock$6(_component_v_btn, {
                  key: 0,
                  size: "x-small",
                  color: __props.isFavorited ? "red" : "grey",
                  variant: __props.isFavorited ? "flat" : "tonal",
                  icon: __props.isFavorited ? "mdi-heart" : "mdi-heart-outline",
                  onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("toggle-favorite", __props.book.id))
                }, null, 8, ["color", "variant", "icon"])) : _createCommentVNode$5("", true),
                _createVNode$6(_component_v_btn, {
                  size: "x-small",
                  color: "success",
                  variant: "flat",
                  "prepend-icon": "mdi-download-box",
                  loading: __props.isDownloading,
                  onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("download", __props.book.id))
                }, {
                  default: _withCtx$6(() => [..._cache[4] || (_cache[4] = [
                    _createTextVNode$6(" 下载 ", -1)
                  ])]),
                  _: 1
                }, 8, ["loading"])
              ], true)
            ]),
            _: 3
          })
        ]),
        _: 3
      });
    };
  }
});

const BookCard = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-5553aa6b"]]);

const {defineComponent:_defineComponent$5} = await importShared('vue');

const {toDisplayString:_toDisplayString$4,createTextVNode:_createTextVNode$5,resolveComponent:_resolveComponent$5,withCtx:_withCtx$5,createVNode:_createVNode$5,openBlock:_openBlock$5,createBlock:_createBlock$5,createCommentVNode:_createCommentVNode$4,renderList:_renderList$2,Fragment:_Fragment$2,createElementBlock:_createElementBlock$3,renderSlot:_renderSlot} = await importShared('vue');
const _sfc_main$5 = /* @__PURE__ */ _defineComponent$5({
  __name: "BookGrid",
  props: {
    books: {},
    title: {},
    icon: {},
    favoriteBookIds: {},
    downloadingBookId: { default: null },
    loading: { type: Boolean, default: false },
    showRefresh: { type: Boolean, default: false },
    showFavorite: { type: Boolean, default: true },
    getCoverUrl: {}
  },
  emits: ["detail", "toggle-favorite", "download", "refresh"],
  setup(__props) {
    return (_ctx, _cache) => {
      const _component_v_icon = _resolveComponent$5("v-icon");
      const _component_v_spacer = _resolveComponent$5("v-spacer");
      const _component_v_chip = _resolveComponent$5("v-chip");
      const _component_v_btn = _resolveComponent$5("v-btn");
      const _component_v_card_title = _resolveComponent$5("v-card-title");
      const _component_v_col = _resolveComponent$5("v-col");
      const _component_v_row = _resolveComponent$5("v-row");
      const _component_v_card_text = _resolveComponent$5("v-card-text");
      const _component_v_card = _resolveComponent$5("v-card");
      return _openBlock$5(), _createBlock$5(_component_v_card, { class: "elevation-4" }, {
        default: _withCtx$5(() => [
          _createVNode$5(_component_v_card_title, { class: "d-flex align-center py-3" }, {
            default: _withCtx$5(() => [
              _createVNode$5(_component_v_icon, {
                start: "",
                color: "primary"
              }, {
                default: _withCtx$5(() => [
                  _createTextVNode$5(_toDisplayString$4(__props.icon), 1)
                ]),
                _: 1
              }),
              _createTextVNode$5(" " + _toDisplayString$4(__props.title) + " ", 1),
              _createVNode$5(_component_v_spacer),
              _createVNode$5(_component_v_chip, {
                color: "primary",
                size: "small"
              }, {
                default: _withCtx$5(() => [
                  _createTextVNode$5(_toDisplayString$4(__props.books.length) + " 本", 1)
                ]),
                _: 1
              }),
              __props.showRefresh ? (_openBlock$5(), _createBlock$5(_component_v_btn, {
                key: 0,
                size: "small",
                variant: "text",
                icon: "mdi-refresh",
                onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("refresh")),
                loading: __props.loading,
                class: "ml-2"
              }, null, 8, ["loading"])) : _createCommentVNode$4("", true)
            ]),
            _: 1
          }),
          _createVNode$5(_component_v_card_text, { class: "pa-3" }, {
            default: _withCtx$5(() => [
              _createVNode$5(_component_v_row, { dense: "" }, {
                default: _withCtx$5(() => [
                  (_openBlock$5(true), _createElementBlock$3(_Fragment$2, null, _renderList$2(__props.books, (book) => {
                    return _openBlock$5(), _createBlock$5(_component_v_col, {
                      key: book.id,
                      cols: "6",
                      sm: "4",
                      md: "3",
                      lg: "2",
                      xl: "2"
                    }, {
                      default: _withCtx$5(() => [
                        _createVNode$5(BookCard, {
                          book,
                          "cover-url": __props.getCoverUrl(book),
                          "is-favorited": __props.favoriteBookIds.has(book.id),
                          "is-downloading": __props.downloadingBookId === book.id,
                          "show-favorite": __props.showFavorite,
                          onDetail: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("detail", $event)),
                          onToggleFavorite: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("toggle-favorite", $event)),
                          onDownload: _cache[3] || (_cache[3] = ($event) => _ctx.$emit("download", $event))
                        }, {
                          badge: _withCtx$5(({ book: book2 }) => [
                            _renderSlot(_ctx.$slots, "badge", { book: book2 })
                          ]),
                          actions: _withCtx$5(({ book: book2 }) => [
                            _renderSlot(_ctx.$slots, "actions", { book: book2 })
                          ]),
                          _: 2
                        }, 1032, ["book", "cover-url", "is-favorited", "is-downloading", "show-favorite"])
                      ]),
                      _: 2
                    }, 1024);
                  }), 128))
                ]),
                _: 3
              })
            ]),
            _: 3
          })
        ]),
        _: 3
      });
    };
  }
});

const {defineComponent:_defineComponent$4} = await importShared('vue');

const {toDisplayString:_toDisplayString$3,createTextVNode:_createTextVNode$4,resolveComponent:_resolveComponent$4,withCtx:_withCtx$4,createVNode:_createVNode$4,createElementVNode:_createElementVNode$4,renderList:_renderList$1,Fragment:_Fragment$1,openBlock:_openBlock$4,createElementBlock:_createElementBlock$2,createBlock:_createBlock$4,createCommentVNode:_createCommentVNode$3} = await importShared('vue');

const _hoisted_1$3 = { class: "text-body-2 font-weight-medium" };
const _hoisted_2$2 = { class: "text-body-2 font-weight-medium" };
const _hoisted_3$2 = { class: "text-body-2 font-weight-medium" };
const _hoisted_4$2 = { class: "text-body-2 font-weight-medium" };
const _hoisted_5$2 = { class: "text-body-2 font-weight-medium" };
const _hoisted_6 = { class: "text-body-2 font-weight-medium" };
const _hoisted_7 = {
  key: 0,
  class: "mt-4"
};
const _hoisted_8 = {
  class: "line-clamp-8",
  style: { "line-height": "1.8" }
};
const {computed: computed$1} = await importShared('vue');

const _sfc_main$4 = /* @__PURE__ */ _defineComponent$4({
  __name: "BookDetailDialog",
  props: {
    modelValue: { type: Boolean },
    book: {},
    coverUrl: {},
    isFavorited: { type: Boolean, default: false },
    isDownloading: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "toggle-favorite", "download"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const dialogVisible = computed$1({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value)
    });
    const formatFileSize = (bytes) => {
      if (!bytes || bytes === 0) return "未知";
      const units = ["B", "KB", "MB", "GB"];
      let size = bytes;
      let unitIndex = 0;
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      return `${size.toFixed(2)} ${units[unitIndex]}`;
    };
    return (_ctx, _cache) => {
      const _component_v_toolbar_title = _resolveComponent$4("v-toolbar-title");
      const _component_v_spacer = _resolveComponent$4("v-spacer");
      const _component_v_btn = _resolveComponent$4("v-btn");
      const _component_v_toolbar = _resolveComponent$4("v-toolbar");
      const _component_v_progress_circular = _resolveComponent$4("v-progress-circular");
      const _component_v_row = _resolveComponent$4("v-row");
      const _component_v_img = _resolveComponent$4("v-img");
      const _component_v_card_actions = _resolveComponent$4("v-card-actions");
      const _component_v_card = _resolveComponent$4("v-card");
      const _component_v_col = _resolveComponent$4("v-col");
      const _component_v_card_title = _resolveComponent$4("v-card-title");
      const _component_v_icon = _resolveComponent$4("v-icon");
      const _component_v_card_subtitle = _resolveComponent$4("v-card-subtitle");
      const _component_v_divider = _resolveComponent$4("v-divider");
      const _component_v_chip = _resolveComponent$4("v-chip");
      const _component_v_chip_group = _resolveComponent$4("v-chip-group");
      const _component_v_card_text = _resolveComponent$4("v-card-text");
      const _component_v_dialog = _resolveComponent$4("v-dialog");
      return _openBlock$4(), _createBlock$4(_component_v_dialog, {
        modelValue: dialogVisible.value,
        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => dialogVisible.value = $event),
        "max-width": "900",
        transition: "dialog-bottom-transition"
      }, {
        default: _withCtx$4(() => [
          __props.book ? (_openBlock$4(), _createBlock$4(_component_v_card, {
            key: 0,
            class: "rounded-xl overflow-hidden"
          }, {
            default: _withCtx$4(() => [
              _createVNode$4(_component_v_toolbar, {
                density: "compact",
                color: "primary",
                dark: ""
              }, {
                default: _withCtx$4(() => [
                  _createVNode$4(_component_v_toolbar_title, { class: "text-h6 font-weight-bold" }, {
                    default: _withCtx$4(() => [
                      _createTextVNode$4(_toDisplayString$3(__props.book.title), 1)
                    ]),
                    _: 1
                  }),
                  _createVNode$4(_component_v_spacer),
                  _createVNode$4(_component_v_btn, {
                    icon: "mdi-close",
                    onClick: _cache[0] || (_cache[0] = ($event) => dialogVisible.value = false),
                    variant: "text"
                  })
                ]),
                _: 1
              }),
              _createVNode$4(_component_v_card_text, { class: "pa-6" }, {
                default: _withCtx$4(() => [
                  _createVNode$4(_component_v_row, null, {
                    default: _withCtx$4(() => [
                      _createVNode$4(_component_v_col, {
                        cols: "12",
                        md: "4"
                      }, {
                        default: _withCtx$4(() => [
                          _createVNode$4(_component_v_card, {
                            flat: "",
                            class: "elevation-3 rounded-xl overflow-hidden"
                          }, {
                            default: _withCtx$4(() => [
                              _createVNode$4(_component_v_img, {
                                src: __props.coverUrl,
                                height: "400",
                                cover: "",
                                class: "bg-grey-lighten-3"
                              }, {
                                placeholder: _withCtx$4(() => [
                                  _createVNode$4(_component_v_row, {
                                    class: "fill-height ma-0",
                                    align: "center",
                                    justify: "center"
                                  }, {
                                    default: _withCtx$4(() => [
                                      _createVNode$4(_component_v_progress_circular, {
                                        indeterminate: "",
                                        color: "primary"
                                      })
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }, 8, ["src"]),
                              _createVNode$4(_component_v_card_actions, {
                                class: "position-absolute bottom-0 w-100",
                                style: { "background": "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }
                              }, {
                                default: _withCtx$4(() => [
                                  _createVNode$4(_component_v_spacer),
                                  _createVNode$4(_component_v_btn, {
                                    size: "large",
                                    color: __props.isFavorited ? "red" : "white",
                                    variant: __props.isFavorited ? "flat" : "outlined",
                                    icon: __props.isFavorited ? "mdi-heart" : "mdi-heart-outline",
                                    onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("toggle-favorite", __props.book.id)),
                                    class: "mb-2 mr-2"
                                  }, null, 8, ["color", "variant", "icon"])
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      _createVNode$4(_component_v_col, {
                        cols: "12",
                        md: "8"
                      }, {
                        default: _withCtx$4(() => [
                          _createVNode$4(_component_v_card, {
                            flat: "",
                            class: "mb-4"
                          }, {
                            default: _withCtx$4(() => [
                              _createVNode$4(_component_v_card_title, { class: "text-h5 font-weight-bold mb-2" }, {
                                default: _withCtx$4(() => [
                                  _createTextVNode$4(_toDisplayString$3(__props.book.title), 1)
                                ]),
                                _: 1
                              }),
                              _createVNode$4(_component_v_card_subtitle, { class: "text-body-1 text-blue-accent-4 mb-3" }, {
                                default: _withCtx$4(() => [
                                  _createVNode$4(_component_v_icon, {
                                    start: "",
                                    size: "small"
                                  }, {
                                    default: _withCtx$4(() => [..._cache[4] || (_cache[4] = [
                                      _createTextVNode$4("mdi-account", -1)
                                    ])]),
                                    _: 1
                                  }),
                                  _createTextVNode$4(" " + _toDisplayString$3(__props.book.author || "未知作者"), 1)
                                ]),
                                _: 1
                              }),
                              _createVNode$4(_component_v_divider, { class: "mb-3" }),
                              _createVNode$4(_component_v_row, { dense: "" }, {
                                default: _withCtx$4(() => [
                                  _createVNode$4(_component_v_col, {
                                    cols: "6",
                                    sm: "4"
                                  }, {
                                    default: _withCtx$4(() => [
                                      _cache[6] || (_cache[6] = _createElementVNode$4("div", { class: "text-caption text-medium-emphasis mb-1" }, "出版社", -1)),
                                      _createElementVNode$4("div", _hoisted_1$3, [
                                        _createVNode$4(_component_v_icon, {
                                          start: "",
                                          size: "x-small",
                                          color: "info"
                                        }, {
                                          default: _withCtx$4(() => [..._cache[5] || (_cache[5] = [
                                            _createTextVNode$4("mdi-bookshelf", -1)
                                          ])]),
                                          _: 1
                                        }),
                                        _createTextVNode$4(" " + _toDisplayString$3(__props.book.publisher || "未知"), 1)
                                      ])
                                    ]),
                                    _: 1
                                  }),
                                  _createVNode$4(_component_v_col, {
                                    cols: "6",
                                    sm: "4"
                                  }, {
                                    default: _withCtx$4(() => [
                                      _cache[8] || (_cache[8] = _createElementVNode$4("div", { class: "text-caption text-medium-emphasis mb-1" }, "出版日期", -1)),
                                      _createElementVNode$4("div", _hoisted_2$2, [
                                        _createVNode$4(_component_v_icon, {
                                          start: "",
                                          size: "x-small",
                                          color: "success"
                                        }, {
                                          default: _withCtx$4(() => [..._cache[7] || (_cache[7] = [
                                            _createTextVNode$4("mdi-calendar", -1)
                                          ])]),
                                          _: 1
                                        }),
                                        _createTextVNode$4(" " + _toDisplayString$3(__props.book.pubdate || "未知"), 1)
                                      ])
                                    ]),
                                    _: 1
                                  }),
                                  _createVNode$4(_component_v_col, {
                                    cols: "6",
                                    sm: "4"
                                  }, {
                                    default: _withCtx$4(() => [
                                      _cache[10] || (_cache[10] = _createElementVNode$4("div", { class: "text-caption text-medium-emphasis mb-1" }, "语言", -1)),
                                      _createElementVNode$4("div", _hoisted_3$2, [
                                        _createVNode$4(_component_v_icon, {
                                          start: "",
                                          size: "x-small",
                                          color: "warning"
                                        }, {
                                          default: _withCtx$4(() => [..._cache[9] || (_cache[9] = [
                                            _createTextVNode$4("mdi-translate", -1)
                                          ])]),
                                          _: 1
                                        }),
                                        _createTextVNode$4(" " + _toDisplayString$3(__props.book.language || "中文"), 1)
                                      ])
                                    ]),
                                    _: 1
                                  }),
                                  _createVNode$4(_component_v_col, {
                                    cols: "6",
                                    sm: "4"
                                  }, {
                                    default: _withCtx$4(() => [
                                      _cache[12] || (_cache[12] = _createElementVNode$4("div", { class: "text-caption text-medium-emphasis mb-1" }, "文件格式", -1)),
                                      _createElementVNode$4("div", _hoisted_4$2, [
                                        _createVNode$4(_component_v_icon, {
                                          start: "",
                                          size: "x-small",
                                          color: "purple"
                                        }, {
                                          default: _withCtx$4(() => [..._cache[11] || (_cache[11] = [
                                            _createTextVNode$4("mdi-file-document", -1)
                                          ])]),
                                          _: 1
                                        }),
                                        _createTextVNode$4(" " + _toDisplayString$3(__props.book.format || "EPUB"), 1)
                                      ])
                                    ]),
                                    _: 1
                                  }),
                                  _createVNode$4(_component_v_col, {
                                    cols: "6",
                                    sm: "4"
                                  }, {
                                    default: _withCtx$4(() => [
                                      _cache[14] || (_cache[14] = _createElementVNode$4("div", { class: "text-caption text-medium-emphasis mb-1" }, "文件大小", -1)),
                                      _createElementVNode$4("div", _hoisted_5$2, [
                                        _createVNode$4(_component_v_icon, {
                                          start: "",
                                          size: "x-small",
                                          color: "teal"
                                        }, {
                                          default: _withCtx$4(() => [..._cache[13] || (_cache[13] = [
                                            _createTextVNode$4("mdi-database", -1)
                                          ])]),
                                          _: 1
                                        }),
                                        _createTextVNode$4(" " + _toDisplayString$3(__props.book.size ? formatFileSize(__props.book.size) : "未知"), 1)
                                      ])
                                    ]),
                                    _: 1
                                  }),
                                  _createVNode$4(_component_v_col, {
                                    cols: "6",
                                    sm: "4"
                                  }, {
                                    default: _withCtx$4(() => [
                                      _cache[16] || (_cache[16] = _createElementVNode$4("div", { class: "text-caption text-medium-emphasis mb-1" }, "ISBN", -1)),
                                      _createElementVNode$4("div", _hoisted_6, [
                                        _createVNode$4(_component_v_icon, {
                                          start: "",
                                          size: "x-small",
                                          color: "deep-purple"
                                        }, {
                                          default: _withCtx$4(() => [..._cache[15] || (_cache[15] = [
                                            _createTextVNode$4("mdi-barcode", -1)
                                          ])]),
                                          _: 1
                                        }),
                                        _createTextVNode$4(" " + _toDisplayString$3(__props.book.isbn || "无"), 1)
                                      ])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              __props.book.tags || __props.book.tag ? (_openBlock$4(), _createElementBlock$2("div", _hoisted_7, [
                                _cache[17] || (_cache[17] = _createElementVNode$4("div", { class: "text-caption text-medium-emphasis mb-2" }, "标签", -1)),
                                _createVNode$4(_component_v_chip_group, { column: "" }, {
                                  default: _withCtx$4(() => [
                                    (_openBlock$4(true), _createElementBlock$2(_Fragment$1, null, _renderList$1(__props.book.tags || [__props.book.tag], (tag) => {
                                      return _openBlock$4(), _createBlock$4(_component_v_chip, {
                                        key: tag,
                                        size: "small",
                                        variant: "tonal",
                                        color: "primary",
                                        "prepend-icon": "mdi-tag"
                                      }, {
                                        default: _withCtx$4(() => [
                                          _createTextVNode$4(_toDisplayString$3(tag), 1)
                                        ]),
                                        _: 2
                                      }, 1024);
                                    }), 128))
                                  ]),
                                  _: 1
                                })
                              ])) : _createCommentVNode$3("", true)
                            ]),
                            _: 1
                          }),
                          __props.book.comments ? (_openBlock$4(), _createBlock$4(_component_v_card, {
                            key: 0,
                            flat: "",
                            class: "mb-4"
                          }, {
                            default: _withCtx$4(() => [
                              _createVNode$4(_component_v_card_title, { class: "text-h6 font-weight-bold d-flex align-center py-2" }, {
                                default: _withCtx$4(() => [
                                  _createVNode$4(_component_v_icon, {
                                    start: "",
                                    color: "primary"
                                  }, {
                                    default: _withCtx$4(() => [..._cache[18] || (_cache[18] = [
                                      _createTextVNode$4("mdi-text-box-outline", -1)
                                    ])]),
                                    _: 1
                                  }),
                                  _cache[19] || (_cache[19] = _createTextVNode$4(" 内容简介 ", -1))
                                ]),
                                _: 1
                              }),
                              _createVNode$4(_component_v_card_text, { class: "text-body-2 text-medium-emphasis pt-0" }, {
                                default: _withCtx$4(() => [
                                  _createElementVNode$4("div", _hoisted_8, _toDisplayString$3(__props.book.comments), 1)
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          })) : _createCommentVNode$3("", true),
                          _createVNode$4(_component_v_card, { flat: "" }, {
                            default: _withCtx$4(() => [
                              _createVNode$4(_component_v_card_actions, { class: "px-0" }, {
                                default: _withCtx$4(() => [
                                  _createVNode$4(_component_v_spacer),
                                  _createVNode$4(_component_v_btn, {
                                    color: "success",
                                    size: "large",
                                    variant: "elevated",
                                    "prepend-icon": "mdi-download-box",
                                    loading: __props.isDownloading,
                                    onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("download", __props.book.id)),
                                    class: "elevation-2"
                                  }, {
                                    default: _withCtx$4(() => [..._cache[20] || (_cache[20] = [
                                      _createTextVNode$4(" 下载图书 ", -1)
                                    ])]),
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
                  })
                ]),
                _: 1
              })
            ]),
            _: 1
          })) : _createCommentVNode$3("", true)
        ]),
        _: 1
      }, 8, ["modelValue"]);
    };
  }
});

const BookDetailDialog = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-68b194f6"]]);

const {defineComponent:_defineComponent$3} = await importShared('vue');

const {createTextVNode:_createTextVNode$3,resolveComponent:_resolveComponent$3,withCtx:_withCtx$3,createVNode:_createVNode$3,toDisplayString:_toDisplayString$2,createElementVNode:_createElementVNode$3,openBlock:_openBlock$3,createElementBlock:_createElementBlock$1,createCommentVNode:_createCommentVNode$2,createBlock:_createBlock$3} = await importShared('vue');

const _hoisted_1$2 = {
  key: 0,
  class: "mt-3"
};
const _hoisted_2$1 = { class: "text-h5 font-weight-bold text-grey-darken-2" };
const _hoisted_3$1 = { class: "text-h5 font-weight-bold" };
const _hoisted_4$1 = { class: "text-h5 font-weight-bold" };
const _hoisted_5$1 = { class: "text-h5 font-weight-bold" };
const _sfc_main$3 = /* @__PURE__ */ _defineComponent$3({
  __name: "ScanPanel",
  props: {
    scanning: { type: Boolean },
    progress: {}
  },
  emits: ["scan", "view-recent"],
  setup(__props) {
    return (_ctx, _cache) => {
      const _component_v_icon = _resolveComponent$3("v-icon");
      const _component_v_card_title = _resolveComponent$3("v-card-title");
      const _component_v_alert = _resolveComponent$3("v-alert");
      const _component_v_stepper = _resolveComponent$3("v-stepper");
      const _component_v_divider = _resolveComponent$3("v-divider");
      const _component_v_card = _resolveComponent$3("v-card");
      const _component_v_col = _resolveComponent$3("v-col");
      const _component_v_row = _resolveComponent$3("v-row");
      const _component_v_card_text = _resolveComponent$3("v-card-text");
      const _component_v_btn = _resolveComponent$3("v-btn");
      return _openBlock$3(), _createElementBlock$1("div", null, [
        __props.scanning ? (_openBlock$3(), _createBlock$3(_component_v_card, {
          key: 0,
          class: "mb-6 elevation-4"
        }, {
          default: _withCtx$3(() => [
            _createVNode$3(_component_v_card_title, { class: "text-subtitle-1 py-3" }, {
              default: _withCtx$3(() => [
                _createVNode$3(_component_v_icon, {
                  start: "",
                  color: "primary",
                  class: "animate-spin"
                }, {
                  default: _withCtx$3(() => [..._cache[2] || (_cache[2] = [
                    _createTextVNode$3("mdi-loading", -1)
                  ])]),
                  _: 1
                }),
                _createTextVNode$3(" " + _toDisplayString$2(__props.progress.stepName), 1)
              ]),
              _: 1
            }),
            _createVNode$3(_component_v_card_text, { class: "pa-5" }, {
              default: _withCtx$3(() => [
                _createVNode$3(_component_v_stepper, {
                  "model-value": __props.progress.step,
                  "alt-labels": "",
                  class: "elevation-0"
                }, {
                  "item.1": _withCtx$3(() => [
                    _createVNode$3(_component_v_alert, {
                      type: "info",
                      variant: "tonal"
                    }, {
                      default: _withCtx$3(() => [
                        _createTextVNode$3(_toDisplayString$2(__props.progress.message), 1)
                      ]),
                      _: 1
                    })
                  ]),
                  "item.2": _withCtx$3(() => [
                    _createVNode$3(_component_v_alert, {
                      type: "info",
                      variant: "tonal"
                    }, {
                      default: _withCtx$3(() => [
                        _createTextVNode$3(_toDisplayString$2(__props.progress.message), 1)
                      ]),
                      _: 1
                    })
                  ]),
                  "item.3": _withCtx$3(() => [
                    _createVNode$3(_component_v_alert, {
                      type: "success",
                      variant: "tonal"
                    }, {
                      default: _withCtx$3(() => [
                        _createTextVNode$3(_toDisplayString$2(__props.progress.message), 1)
                      ]),
                      _: 1
                    })
                  ]),
                  "item.4": _withCtx$3(() => [
                    _createVNode$3(_component_v_alert, {
                      type: "success",
                      variant: "tonal"
                    }, {
                      default: _withCtx$3(() => [
                        _createTextVNode$3(_toDisplayString$2(__props.progress.message), 1)
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["model-value"]),
                _createVNode$3(_component_v_divider, { class: "my-4" }),
                __props.progress.details.totalFiles !== void 0 ? (_openBlock$3(), _createElementBlock$1("div", _hoisted_1$2, [
                  _createVNode$3(_component_v_row, null, {
                    default: _withCtx$3(() => [
                      _createVNode$3(_component_v_col, {
                        cols: "6",
                        md: "3"
                      }, {
                        default: _withCtx$3(() => [
                          _createVNode$3(_component_v_card, {
                            variant: "outlined",
                            class: "text-center py-3 rounded-xl"
                          }, {
                            default: _withCtx$3(() => [
                              _createElementVNode$3("div", _hoisted_2$1, _toDisplayString$2(__props.progress.details.totalFiles), 1),
                              _cache[3] || (_cache[3] = _createElementVNode$3("div", { class: "text-caption text-grey mt-1" }, "总文件数", -1))
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      _createVNode$3(_component_v_col, {
                        cols: "6",
                        md: "3"
                      }, {
                        default: _withCtx$3(() => [
                          _createVNode$3(_component_v_card, {
                            variant: "outlined",
                            class: "text-center py-3 rounded-xl",
                            color: "info"
                          }, {
                            default: _withCtx$3(() => [
                              _createElementVNode$3("div", _hoisted_3$1, _toDisplayString$2(__props.progress.details.newFiles || 0), 1),
                              _cache[4] || (_cache[4] = _createElementVNode$3("div", { class: "text-caption mt-1" }, "新增文件", -1))
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      _createVNode$3(_component_v_col, {
                        cols: "6",
                        md: "3"
                      }, {
                        default: _withCtx$3(() => [
                          _createVNode$3(_component_v_card, {
                            variant: "outlined",
                            class: "text-center py-3 rounded-xl",
                            color: "warning"
                          }, {
                            default: _withCtx$3(() => [
                              _createElementVNode$3("div", _hoisted_4$1, _toDisplayString$2(__props.progress.details.existFiles || 0), 1),
                              _cache[5] || (_cache[5] = _createElementVNode$3("div", { class: "text-caption mt-1" }, "已存在", -1))
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      _createVNode$3(_component_v_col, {
                        cols: "6",
                        md: "3"
                      }, {
                        default: _withCtx$3(() => [
                          _createVNode$3(_component_v_card, {
                            variant: "outlined",
                            class: "text-center py-3 rounded-xl",
                            color: "success"
                          }, {
                            default: _withCtx$3(() => [
                              _createElementVNode$3("div", _hoisted_5$1, _toDisplayString$2(__props.progress.details.importedCount || 0), 1),
                              _cache[6] || (_cache[6] = _createElementVNode$3("div", { class: "text-caption mt-1" }, "已导入", -1))
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ])) : _createCommentVNode$2("", true)
              ]),
              _: 1
            })
          ]),
          _: 1
        })) : _createCommentVNode$2("", true),
        _createVNode$3(_component_v_card, { class: "mb-6 elevation-4" }, {
          default: _withCtx$3(() => [
            _createVNode$3(_component_v_card_text, { class: "pa-5" }, {
              default: _withCtx$3(() => [
                _createVNode$3(_component_v_row, null, {
                  default: _withCtx$3(() => [
                    _createVNode$3(_component_v_col, {
                      cols: "12",
                      md: "6"
                    }, {
                      default: _withCtx$3(() => [
                        _createVNode$3(_component_v_btn, {
                          color: "primary",
                          size: "large",
                          variant: "elevated",
                          "prepend-icon": "mdi-play-circle",
                          loading: __props.scanning,
                          block: "",
                          onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("scan"))
                        }, {
                          default: _withCtx$3(() => [..._cache[7] || (_cache[7] = [
                            _createTextVNode$3(" 一键扫描导入 ", -1)
                          ])]),
                          _: 1
                        }, 8, ["loading"])
                      ]),
                      _: 1
                    }),
                    _createVNode$3(_component_v_col, {
                      cols: "12",
                      md: "6"
                    }, {
                      default: _withCtx$3(() => [
                        _createVNode$3(_component_v_btn, {
                          color: "secondary",
                          variant: "tonal",
                          size: "large",
                          "prepend-icon": "mdi-history",
                          block: "",
                          onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("view-recent"))
                        }, {
                          default: _withCtx$3(() => [..._cache[8] || (_cache[8] = [
                            _createTextVNode$3(" 查看最近添加 ", -1)
                          ])]),
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
            })
          ]),
          _: 1
        })
      ]);
    };
  }
});

const ScanPanel = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-95a3d129"]]);

const {ref: ref$2} = await importShared('vue');

const snackbar = ref$2({
  show: false,
  message: "",
  color: "success",
  icon: "mdi-check-circle",
  timeout: 3e3
});
function useToast() {
  const showToast = (message, type = "success", timeout = 3e3) => {
    const configMap = {
      success: {
        color: "success",
        icon: "mdi-check-circle"
      },
      error: {
        color: "error",
        icon: "mdi-alert-circle"
      },
      warning: {
        color: "warning",
        icon: "mdi-alert"
      },
      info: {
        color: "info",
        icon: "mdi-information"
      }
    };
    const config = configMap[type];
    snackbar.value = {
      show: true,
      message,
      color: config.color,
      icon: config.icon,
      timeout
    };
  };
  const hideToast = () => {
    snackbar.value.show = false;
  };
  return {
    snackbar,
    showToast,
    hideToast
  };
}

const {defineComponent:_defineComponent$2} = await importShared('vue');

const {unref:_unref,toDisplayString:_toDisplayString$1,createTextVNode:_createTextVNode$2,resolveComponent:_resolveComponent$2,withCtx:_withCtx$2,createVNode:_createVNode$2,createElementVNode:_createElementVNode$2,openBlock:_openBlock$2,createBlock:_createBlock$2} = await importShared('vue');

const _hoisted_1$1 = { class: "d-flex align-center" };
const _sfc_main$2 = /* @__PURE__ */ _defineComponent$2({
  __name: "ToastNotification",
  setup(__props) {
    const { snackbar } = useToast();
    return (_ctx, _cache) => {
      const _component_v_icon = _resolveComponent$2("v-icon");
      const _component_v_btn = _resolveComponent$2("v-btn");
      const _component_v_snackbar = _resolveComponent$2("v-snackbar");
      return _openBlock$2(), _createBlock$2(_component_v_snackbar, {
        modelValue: _unref(snackbar).show,
        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => _unref(snackbar).show = $event),
        color: _unref(snackbar).color,
        timeout: _unref(snackbar).timeout,
        location: "top",
        variant: "flat",
        elevation: "8",
        rounded: "lg"
      }, {
        actions: _withCtx$2(() => [
          _createVNode$2(_component_v_btn, {
            color: "white",
            variant: "text",
            onClick: _cache[0] || (_cache[0] = ($event) => _unref(snackbar).show = false)
          }, {
            default: _withCtx$2(() => [..._cache[2] || (_cache[2] = [
              _createTextVNode$2(" 关闭 ", -1)
            ])]),
            _: 1
          })
        ]),
        default: _withCtx$2(() => [
          _createElementVNode$2("div", _hoisted_1$1, [
            _createVNode$2(_component_v_icon, { start: "" }, {
              default: _withCtx$2(() => [
                _createTextVNode$2(_toDisplayString$1(_unref(snackbar).icon), 1)
              ]),
              _: 1
            }),
            _createElementVNode$2("span", null, _toDisplayString$1(_unref(snackbar).message), 1)
          ])
        ]),
        _: 1
      }, 8, ["modelValue", "color", "timeout"]);
    };
  }
});

const {defineComponent:_defineComponent$1} = await importShared('vue');

const {resolveComponent:_resolveComponent$1,createVNode:_createVNode$1,withCtx:_withCtx$1,createTextVNode:_createTextVNode$1,toDisplayString:_toDisplayString,renderList:_renderList,Fragment:_Fragment,openBlock:_openBlock$1,createElementBlock:_createElementBlock,createElementVNode:_createElementVNode$1,mergeProps:_mergeProps,createBlock:_createBlock$1,createCommentVNode:_createCommentVNode$1} = await importShared('vue');

const _hoisted_1 = { class: "meta-category-page" };
const _hoisted_2 = { class: "d-flex align-center justify-space-between" };
const _hoisted_3 = { class: "flex-grow-1 mr-2" };
const _hoisted_4 = { class: "text-subtitle-1 font-weight-medium text-truncate" };
const _hoisted_5 = { class: "text-caption text-grey mt-1" };
const {ref: ref$1,onMounted: onMounted$1} = await importShared('vue');

const _sfc_main$1 = /* @__PURE__ */ _defineComponent$1({
  __name: "MetaCategory",
  props: {
    api: { default: void 0 }
  },
  setup(__props) {
    const props = __props;
    const selectedMetaType = ref$1("tag");
    const metaList = ref$1([]);
    const loading = ref$1(false);
    const metaTypes = [
      { label: "标签", value: "tag", icon: "mdi-tag" },
      { label: "作者", value: "author", icon: "mdi-account" },
      { label: "丛书", value: "series", icon: "mdi-bookshelf" },
      { label: "评分", value: "rating", icon: "mdi-star" },
      { label: "出版社", value: "publisher", icon: "mdi-domain" },
      { label: "语言", value: "language", icon: "mdi-translate" }
    ];
    function getMetaTypeName(type) {
      const typeMap = {
        tag: "标签",
        author: "作者",
        series: "丛书",
        rating: "评分",
        publisher: "出版社",
        language: "语言"
      };
      return typeMap[type] || type;
    }
    async function loadMetaList() {
      loading.value = true;
      metaList.value = [];
      try {
        if (props.api) {
          console.log("[MetaCategory] 开始加载元数据列表:", selectedMetaType.value);
          const response = await props.api.get(`/plugin/Talebook/meta/${selectedMetaType.value}`, {
            params: { show_all: true }
          });
          console.log("[MetaCategory] API 响应类型:", typeof response);
          console.log("[MetaCategory] API 响应完整内容:", JSON.stringify(response, null, 2));
          let dataList = [];
          if (response && response.code === 200) {
            console.log("[MetaCategory] 检测到 code=200,使用 response.data");
            dataList = response.data || [];
          } else if (Array.isArray(response)) {
            console.log("[MetaCategory] 检测到数组,直接使用");
            dataList = response;
          } else if (response && response.items) {
            console.log("[MetaCategory] 检测到 items 字段,使用 response.items");
            dataList = response.items;
          } else if (response && response.err === "ok" && response.items) {
            console.log("[MetaCategory] 检测到 Talebook 原始格式 err=ok");
            dataList = response.items;
          } else {
            console.warn("[MetaCategory] 无法识别的响应格式,尝试直接使用 response");
            dataList = response || [];
          }
          metaList.value = dataList;
          console.log("[MetaCategory] 加载成功,共", dataList.length, "条");
        } else {
          const response = await fetch(`/plugin/Talebook/meta/${selectedMetaType.value}?show_all=true`);
          const data = await response.json();
          console.log("[MetaCategory] Fetch 响应:", data);
          if (data.code === 200) {
            metaList.value = data.data || [];
          } else {
            console.error("加载元数据列表失败:", data.message);
          }
        }
      } catch (error) {
        console.error("加载元数据列表异常:", error);
      } finally {
        loading.value = false;
      }
    }
    function viewMetaBooks(name) {
      const encodedName = encodeURIComponent(name);
      window.location.href = `#/browse?meta=${selectedMetaType.value}&name=${encodedName}`;
    }
    onMounted$1(() => {
      loadMetaList();
    });
    return (_ctx, _cache) => {
      const _component_v_select = _resolveComponent$1("v-select");
      const _component_v_col = _resolveComponent$1("v-col");
      const _component_v_icon = _resolveComponent$1("v-icon");
      const _component_v_chip = _resolveComponent$1("v-chip");
      const _component_v_row = _resolveComponent$1("v-row");
      const _component_v_card_text = _resolveComponent$1("v-card-text");
      const _component_v_card = _resolveComponent$1("v-card");
      const _component_v_hover = _resolveComponent$1("v-hover");
      const _component_v_empty_state = _resolveComponent$1("v-empty-state");
      const _component_v_progress_circular = _resolveComponent$1("v-progress-circular");
      return _openBlock$1(), _createElementBlock("div", _hoisted_1, [
        _createVNode$1(_component_v_card, { class: "mb-4 elevation-2" }, {
          default: _withCtx$1(() => [
            _createVNode$1(_component_v_card_text, null, {
              default: _withCtx$1(() => [
                _createVNode$1(_component_v_row, { align: "center" }, {
                  default: _withCtx$1(() => [
                    _createVNode$1(_component_v_col, {
                      cols: "12",
                      md: "6"
                    }, {
                      default: _withCtx$1(() => [
                        _createVNode$1(_component_v_select, {
                          modelValue: selectedMetaType.value,
                          "onUpdate:modelValue": [
                            _cache[0] || (_cache[0] = ($event) => selectedMetaType.value = $event),
                            loadMetaList
                          ],
                          items: metaTypes,
                          "item-title": "label",
                          "item-value": "value",
                          label: "选择元数据类型",
                          "prepend-icon": "mdi-tag-multiple",
                          variant: "outlined",
                          density: "comfortable"
                        }, null, 8, ["modelValue"])
                      ]),
                      _: 1
                    }),
                    _createVNode$1(_component_v_col, {
                      cols: "12",
                      md: "6",
                      class: "text-right"
                    }, {
                      default: _withCtx$1(() => [
                        _createVNode$1(_component_v_chip, {
                          color: "primary",
                          size: "large"
                        }, {
                          default: _withCtx$1(() => [
                            _createVNode$1(_component_v_icon, { start: "" }, {
                              default: _withCtx$1(() => [..._cache[1] || (_cache[1] = [
                                _createTextVNode$1("mdi-format-list-bulleted", -1)
                              ])]),
                              _: 1
                            }),
                            _createTextVNode$1(" 共 " + _toDisplayString(metaList.value.length) + " 项 ", 1)
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
            })
          ]),
          _: 1
        }),
        !loading.value ? (_openBlock$1(), _createBlock$1(_component_v_card, {
          key: 0,
          class: "elevation-2"
        }, {
          default: _withCtx$1(() => [
            _createVNode$1(_component_v_card_text, null, {
              default: _withCtx$1(() => [
                _createVNode$1(_component_v_row, null, {
                  default: _withCtx$1(() => [
                    (_openBlock$1(true), _createElementBlock(_Fragment, null, _renderList(metaList.value, (item) => {
                      return _openBlock$1(), _createBlock$1(_component_v_col, {
                        key: item.name,
                        cols: "12",
                        sm: "6",
                        md: "4",
                        lg: "3"
                      }, {
                        default: _withCtx$1(() => [
                          _createVNode$1(_component_v_hover, null, {
                            default: _withCtx$1(({ isHovering, props: props2 }) => [
                              _createVNode$1(_component_v_card, _mergeProps({ ref_for: true }, props2, {
                                class: [{ "on-hover": isHovering }, "transition-swing"],
                                elevation: isHovering ? 8 : 2,
                                onClick: ($event) => viewMetaBooks(item.name)
                              }), {
                                default: _withCtx$1(() => [
                                  _createVNode$1(_component_v_card_text, { class: "pa-4" }, {
                                    default: _withCtx$1(() => [
                                      _createElementVNode$1("div", _hoisted_2, [
                                        _createElementVNode$1("div", _hoisted_3, [
                                          _createElementVNode$1("div", _hoisted_4, _toDisplayString(item.name), 1),
                                          _createElementVNode$1("div", _hoisted_5, [
                                            _createVNode$1(_component_v_icon, {
                                              size: "small",
                                              class: "mr-1"
                                            }, {
                                              default: _withCtx$1(() => [..._cache[2] || (_cache[2] = [
                                                _createTextVNode$1("mdi-book-multiple", -1)
                                              ])]),
                                              _: 1
                                            }),
                                            _createTextVNode$1(" " + _toDisplayString(item.count) + " 本书 ", 1)
                                          ])
                                        ]),
                                        _createVNode$1(_component_v_icon, {
                                          color: "primary",
                                          size: "large"
                                        }, {
                                          default: _withCtx$1(() => [..._cache[3] || (_cache[3] = [
                                            _createTextVNode$1(" mdi-chevron-right ", -1)
                                          ])]),
                                          _: 1
                                        })
                                      ])
                                    ]),
                                    _: 2
                                  }, 1024)
                                ]),
                                _: 2
                              }, 1040, ["class", "elevation", "onClick"])
                            ]),
                            _: 2
                          }, 1024)
                        ]),
                        _: 2
                      }, 1024);
                    }), 128))
                  ]),
                  _: 1
                }),
                metaList.value.length === 0 ? (_openBlock$1(), _createBlock$1(_component_v_empty_state, {
                  key: 0,
                  icon: "mdi-tag-off-outline",
                  title: "暂无数据",
                  text: `还没有${getMetaTypeName(selectedMetaType.value)}信息`,
                  class: "mt-8"
                }, null, 8, ["text"])) : _createCommentVNode$1("", true)
              ]),
              _: 1
            })
          ]),
          _: 1
        })) : (_openBlock$1(), _createBlock$1(_component_v_card, {
          key: 1,
          class: "elevation-2"
        }, {
          default: _withCtx$1(() => [
            _createVNode$1(_component_v_card_text, { class: "text-center py-8" }, {
              default: _withCtx$1(() => [
                _createVNode$1(_component_v_progress_circular, {
                  indeterminate: "",
                  color: "primary",
                  size: "64"
                }),
                _cache[4] || (_cache[4] = _createElementVNode$1("div", { class: "mt-4 text-body-1" }, "加载中...", -1))
              ]),
              _: 1
            })
          ]),
          _: 1
        }))
      ]);
    };
  }
});

const MetaCategory = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-0b3c01ba"]]);

const {defineComponent:_defineComponent} = await importShared('vue');

const {createTextVNode:_createTextVNode,resolveComponent:_resolveComponent,withCtx:_withCtx,createVNode:_createVNode,createElementVNode:_createElementVNode,withKeys:_withKeys,openBlock:_openBlock,createBlock:_createBlock,createCommentVNode:_createCommentVNode} = await importShared('vue');

const {ref,onMounted,watch,computed} = await importShared('vue');
const pluginId = "Talebook";
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "Page",
  props: {
    api: {
      type: Object,
      default: () => ({})
    },
    model: {
      type: Object,
      default: () => ({})
    }
  },
  setup(__props) {
    const props = __props;
    const log = {
      info: (module, message, data) => {
        console.log(`[Talebook:${module}] ℹ️ ${message}`, data || "");
      },
      warn: (module, message, data) => {
        console.warn(`[Talebook:${module}] ⚠️ ${message}`, data || "");
      },
      error: (module, message, error) => {
        console.error(`[Talebook:${module}] ❌ ${message}`, error || "");
      },
      debug: (module, message, data) => {
        console.debug(`[Talebook:${module}] 🔍 ${message}`, data || "");
      }
    };
    const activeTab = ref("scan");
    const searchKeyword = ref("");
    const { showToast } = useToast();
    const books = ref([]);
    const loading = ref(false);
    const scanning = ref(false);
    const scanResult = ref(null);
    const scanProgress = ref({
      step: 0,
      stepName: "",
      message: "",
      details: {}
    });
    const downloadingBook = ref(null);
    const detailDialog = ref(false);
    const selectedBook = ref(null);
    const listTitle = ref("扫描结果");
    const searched = ref(false);
    const favoriteBooks = ref([]);
    const readingBooks = ref([]);
    const loadingFavorites = ref(false);
    const loadingReading = ref(false);
    const favoriteBookIds = computed(() => {
      return new Set(favoriteBooks.value.map((b) => b.id));
    });
    const getApiUrl = (path) => {
      return `/plugin/${pluginId}${path}`;
    };
    const talebookServerUrl = ref("");
    const loadConfig = async () => {
      log.info("Config", "开始加载插件配置...");
      try {
        const startTime = Date.now();
        const response = await safeApiCall(
          () => props.api.get(getApiUrl("/config"))
        );
        const duration = Date.now() - startTime;
        log.info("Config", `配置请求完成 (${duration}ms)`);
        log.debug("Config", "响应数据:", response);
        if (response && response.code === 200 && response.data) {
          talebookServerUrl.value = response.data.server_url || "";
          log.info("Config", "✅ 配置加载成功", {
            server_url: talebookServerUrl.value,
            enabled: response.data.enabled,
            config_complete: response.data.config_complete,
            username: response.data.username ? "***" : void 0
          });
        } else {
          log.warn("Config", "⚠️ 配置加载失败或返回无效", {
            code: response?.code,
            message: response?.message
          });
        }
      } catch (error) {
        log.error("Config", "❌ 加载配置异常", error);
      }
    };
    const getServerUrl = () => {
      if (talebookServerUrl.value) {
        log.debug("Server", "使用缓存的服务器地址:", talebookServerUrl.value);
        return talebookServerUrl.value;
      }
      if (props.model && props.model.server_url) {
        talebookServerUrl.value = props.model.server_url;
        log.info("Server", "✅ 从 props.model 获取服务器地址:", talebookServerUrl.value);
        return talebookServerUrl.value;
      }
      log.warn("Server", "⚠️ 未配置 Talebook 服务器地址");
      log.warn("Server", "请确保:");
      log.warn("Server", "  1. 已在插件设置中配置 Talebook 服务器");
      log.warn("Server", "  2. 已启用插件并保存配置");
      log.warn("Server", "  3. 刷新页面后重试");
      return "";
    };
    const getCoverUrl = (book) => {
      const serverUrl = getServerUrl();
      if (book.thumb) {
        if (book.thumb.startsWith("http://") || book.thumb.startsWith("https://")) {
          return book.thumb;
        } else if (serverUrl) {
          return `${serverUrl}${book.thumb}`;
        } else {
          return getApiUrl(book.thumb);
        }
      }
      if (book.img) {
        if (book.img.startsWith("http://") || book.img.startsWith("https://")) {
          return book.img;
        } else if (serverUrl) {
          return `${serverUrl}${book.img}`;
        } else {
          return getApiUrl(book.img);
        }
      }
      if (book.cover_url) {
        if (book.cover_url.startsWith("http://") || book.cover_url.startsWith("https://")) {
          return book.cover_url;
        } else if (serverUrl) {
          return `${serverUrl}${book.cover_url}`;
        } else {
          return getApiUrl(book.cover_url);
        }
      }
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlNWU1Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIENvdmVyPC90ZXh0Pgo8L3N2Zz4=";
    };
    const getDetailCoverUrl = (book) => {
      const serverUrl = getServerUrl();
      if (book.img) {
        if (book.img.startsWith("http://") || book.img.startsWith("https://")) {
          return book.img;
        } else if (serverUrl) {
          return `${serverUrl}${book.img}`;
        } else {
          return getApiUrl(book.img);
        }
      }
      if (book.thumb) {
        if (book.thumb.startsWith("http://") || book.thumb.startsWith("https://")) {
          return book.thumb;
        } else if (serverUrl) {
          return `${serverUrl}${book.thumb}`;
        } else {
          return getApiUrl(book.thumb);
        }
      }
      if (book.cover_url) {
        if (book.cover_url.startsWith("http://") || book.cover_url.startsWith("https://")) {
          return book.cover_url;
        } else if (serverUrl) {
          return `${serverUrl}${book.cover_url}`;
        } else {
          return getApiUrl(book.cover_url);
        }
      }
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlNWU1Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIENvdmVyPC90ZXh0Pgo8L3N2Zz4=";
    };
    async function safeApiCall(apiCall, retries = 2, delay = 1e3, timeout = 3e4) {
      let lastError = null;
      for (let i = 0; i <= retries; i++) {
        try {
          log.debug("API", `第 ${i + 1}/${retries + 1} 次尝试`);
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error(`请求超时 (${timeout}ms)`));
            }, timeout);
          });
          const result = await Promise.race([
            apiCall(),
            timeoutPromise
          ]);
          log.debug("API", `✅ 请求成功`);
          return result;
        } catch (error) {
          lastError = error;
          log.warn("API", `⚠️ 第 ${i + 1} 次尝试失败:`, error);
          if (i < retries) {
            const waitTime = delay * Math.pow(2, i);
            log.info("API", `等待 ${waitTime}ms 后重试...`);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          }
        }
      }
      log.error("API", "❌ 所有重试均失败");
      throw lastError;
    }
    const handleSearch = async () => {
      if (!searchKeyword.value.trim()) {
        log.warn("Search", "搜索关键词为空");
        return;
      }
      loading.value = true;
      searched.value = true;
      listTitle.value = `搜索: ${searchKeyword.value}`;
      const keyword = searchKeyword.value.trim();
      log.info("Search", `开始搜索: "${keyword}"`);
      try {
        const startTime = Date.now();
        const response = await safeApiCall(
          () => props.api.get(getApiUrl("/search"), {
            params: { keyword }
          })
        );
        const duration = Date.now() - startTime;
        log.debug("Search", `搜索请求完成 (${duration}ms)`, response);
        let booksData = [];
        if (response && response.code === 200) {
          booksData = response.data || [];
          log.info("Search", `✅ 搜索成功，找到 ${booksData.length} 本书`);
        } else if (Array.isArray(response)) {
          booksData = response;
          log.info("Search", `✅ 搜索成功（旧格式），找到 ${booksData.length} 本书`);
        } else {
          log.warn("Search", "⚠️ 搜索返回错误", {
            code: response?.code,
            message: response?.message
          });
          booksData = [];
        }
        books.value = booksData;
        if (books.value.length > 0) {
          log.debug("Search", "第一本书数据:", books.value[0]);
        }
      } catch (error) {
        log.error("Search", "❌ 搜索失败", error);
        showToast(`搜索失败: ${error instanceof Error ? error.message : "未知错误"}`, "error");
        books.value = [];
      } finally {
        loading.value = false;
        log.debug("Search", "搜索状态重置");
      }
    };
    const handleScanAndImport = async () => {
      log.info("Scan", "========== 开始扫描导入 ==========");
      log.debug("Scan", "当前状态:", {
        scanning: scanning.value,
        hasApi: !!props.api,
        apiPostType: typeof props.api?.post
      });
      if (!props.api || typeof props.api.post !== "function") {
        log.error("Scan", "❌ props.api 无效或未提供", {
          api: props.api,
          postType: typeof props.api?.post
        });
        showToast("错误: 无法调用 API，请刷新页面重试", "error");
        return;
      }
      scanning.value = true;
      scanResult.value = null;
      const startTime = Date.now();
      log.info("Scan", `⏱️  开始时间: ${new Date(startTime).toLocaleTimeString()}`);
      scanProgress.value = {
        step: 1,
        stepName: "步骤 1/4 - 提交扫描请求",
        message: "正在向云端提交扫描任务...",
        details: {}
      };
      log.info("Scan", "📤 提交扫描请求...");
      log.debug("Scan", "API URL:", getApiUrl("/scan"));
      try {
        log.info("Scan", "🔄 发起扫描请求...");
        const scanTimeout = 12e4;
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`扫描请求超时 (${scanTimeout / 1e3}秒)`));
          }, scanTimeout);
        });
        const apiPromise = props.api.post(getApiUrl("/scan"));
        log.debug("Scan", `⏱️  设置超时: ${scanTimeout / 1e3}秒`);
        const response = await Promise.race([apiPromise, timeoutPromise]);
        const elapsed = ((Date.now() - startTime) / 1e3).toFixed(1);
        log.info("Scan", `📥 收到响应 (${elapsed}s)`, {
          code: response?.code,
          hasData: !!response?.data
        });
        log.debug("Scan", "完整响应:", response);
        if (response && response.code === 200) {
          scanResult.value = response.data;
          const data = response.data;
          const totalFiles = data.total_files || 0;
          const newFiles = data.new_files || 0;
          const existFiles = data.exist_files || 0;
          const importedCount = data.imported_count || 0;
          const elapsed2 = ((Date.now() - startTime) / 1e3).toFixed(1);
          log.info("Scan", "✅ 扫描数据解析完成", {
            totalFiles,
            newFiles,
            existFiles,
            importedCount,
            elapsed: elapsed2
          });
          scanProgress.value = {
            step: 4,
            stepName: "✅ 完成",
            message: `扫描和导入已完成 (耗时 ${elapsed2}秒)`,
            details: {
              totalFiles,
              newFiles,
              existFiles,
              importedCount
            }
          };
          let message = `✅ 扫描导入完成！
`;
          message += `⏱️  耗时: ${elapsed2}秒 | `;
          message += `📊 总数: ${totalFiles} | 新增: ${newFiles} | 已存在: ${existFiles} | 已导入: ${importedCount}`;
          if (data.scan_timeout) {
            message += "\n⚠️  扫描任务超时，可能仍在后台执行";
            log.warn("Scan", "⚠️ 扫描任务超时");
          } else if (data.import_timeout) {
            message += "\n⚠️  导入任务超时，可能仍在后台执行";
            log.warn("Scan", "⚠️ 导入任务超时");
          }
          showToast(message, "success");
          log.info("Scan", "✅ 扫描导入流程完成", { elapsed: elapsed2, totalFiles, importedCount });
          log.info("Scan", "🔄 加载最近添加的书籍...");
          await loadRecentBooks();
          activeTab.value = "recent";
          log.info("Scan", "✅ 切换到最近添加标签页");
        } else {
          log.error("Scan", "❌ 扫描返回错误", {
            code: response?.code,
            message: response?.message
          });
          showToast(`❌ 扫描失败: ${response?.message || "未知错误"}`, "error");
        }
      } catch (error) {
        const elapsed = ((Date.now() - startTime) / 1e3).toFixed(1);
        let errorMsg = "未知错误";
        let errorDetails = {};
        if (error instanceof Error) {
          errorMsg = error.message;
          errorDetails = {
            name: error.name,
            message: error.message,
            stack: error.stack
          };
        } else if (error && typeof error === "object") {
          errorMsg = error.message || error.msg || JSON.stringify(error);
          errorDetails = error;
        } else {
          errorMsg = String(error);
        }
        log.error("Scan", `❌ 扫描异常 (耗时 ${elapsed}s)`, {
          errorMsg,
          errorDetails,
          rawError: error
        });
        showToast(`❌ 扫描失败: ${errorMsg}`, "error");
      } finally {
        scanning.value = false;
        const totalTime = ((Date.now() - startTime) / 1e3).toFixed(1);
        log.info("Scan", `🏁 扫描流程结束 (总耗时 ${totalTime}s)`);
      }
    };
    const loadRecentBooks = async () => {
      loading.value = true;
      searched.value = false;
      listTitle.value = "最近添加";
      log.info("Recent", "开始加载最近添加的书籍");
      try {
        const startTime = Date.now();
        const response = await safeApiCall(
          () => props.api.get(getApiUrl("/recent"))
        );
        const duration = Date.now() - startTime;
        log.debug("Recent", `请求完成 (${duration}ms)`, response);
        let booksData = [];
        if (response && response.code === 200) {
          booksData = response.data || [];
          log.info("Recent", `✅ 加载成功，共 ${booksData.length} 本书`);
        } else if (Array.isArray(response)) {
          booksData = response;
          log.info("Recent", `✅ 加载成功（旧格式），共 ${booksData.length} 本书`);
        } else {
          log.warn("Recent", "⚠️ 获取最近书籍失败", {
            code: response?.code,
            message: response?.message
          });
          booksData = [];
        }
        books.value = booksData;
        if (books.value.length > 0) {
          log.debug("Recent", "第一本书数据:", books.value[0]);
        }
      } catch (error) {
        log.error("Recent", "❌ 加载最近书籍失败", error);
        books.value = [];
      } finally {
        loading.value = false;
        log.debug("Recent", "加载状态重置");
      }
    };
    const loadFavoriteBooks = async () => {
      loadingFavorites.value = true;
      log.info("Favorites", "开始加载收藏列表");
      try {
        const response = await safeApiCall(
          () => props.api.get(getApiUrl("/favorites/list"), { params: { limit: 50 } })
        );
        if (response && response.code === 200) {
          favoriteBooks.value = response.data?.books || [];
          log.info("Favorites", `✅ 加载成功，共 ${favoriteBooks.value.length} 本书`);
        } else {
          log.warn("Favorites", "⚠️ 获取收藏列表失败", {
            code: response?.code,
            message: response?.message
          });
          favoriteBooks.value = [];
        }
      } catch (error) {
        log.error("Favorites", "❌ 加载收藏列表失败", error);
        favoriteBooks.value = [];
      } finally {
        loadingFavorites.value = false;
      }
    };
    const loadReadingBooks = async () => {
      loadingReading.value = true;
      log.info("Reading", "开始加载在读列表");
      try {
        const response = await safeApiCall(
          () => props.api.get(getApiUrl("/reading/list"), { params: { limit: 20 } })
        );
        if (response && response.code === 200) {
          readingBooks.value = response.data?.books || [];
          log.info("Reading", `✅ 加载成功，共 ${readingBooks.value.length} 本书`);
        } else {
          log.warn("Reading", "⚠️ 获取在读列表失败", {
            code: response?.code,
            message: response?.message
          });
          readingBooks.value = [];
        }
      } catch (error) {
        log.error("Reading", "❌ 加载在读列表失败", error);
        readingBooks.value = [];
      } finally {
        loadingReading.value = false;
      }
    };
    const removeFromFavorites = async (bookId) => {
      log.info("Favorites", `开始取消收藏 (ID: ${bookId})`);
      try {
        const url = getApiUrl(`/book/unfavorite/${bookId}`);
        log.info("Favorites", `发送请求: POST ${url}`);
        const response = await safeApiCall(
          () => props.api.post(url)
        );
        log.debug("Favorites", "收到响应:", response);
        if (response && response.code === 200) {
          showToast("已取消收藏", "success");
          favoriteBooks.value = favoriteBooks.value.filter((b) => b.id !== bookId);
          log.info("Favorites", "✅ 取消收藏成功，已从列表移除");
        } else {
          log.error("Favorites", "❌ 取消收藏失败", {
            code: response?.code,
            message: response?.message
          });
          showToast(`取消收藏失败: ${response?.message}`, "error");
        }
      } catch (error) {
        log.error("Favorites", "❌ 取消收藏异常", error);
        showToast("取消收藏失败", "error");
      }
    };
    const addToFavorites = async (bookId) => {
      log.info("Favorites", `开始添加收藏 (ID: ${bookId})`);
      try {
        const url = getApiUrl(`/book/favorite/${bookId}`);
        log.info("Favorites", `发送请求: POST ${url}`);
        const response = await safeApiCall(
          () => props.api.post(url)
        );
        log.debug("Favorites", "收到响应:", response);
        if (response && response.code === 200) {
          showToast("已添加到收藏", "success");
          log.info("Favorites", "✅ 添加收藏成功");
        } else {
          log.error("Favorites", "❌ 添加收藏失败", {
            code: response?.code,
            message: response?.message
          });
          showToast(`添加收藏失败: ${response?.message}`, "error");
        }
      } catch (error) {
        log.error("Favorites", "❌ 添加收藏异常", error);
        showToast("添加收藏失败", "error");
      }
    };
    const toggleFavorite = async (bookId) => {
      const isFavorited = favoriteBooks.value.some((b) => b.id === bookId);
      if (isFavorited) {
        await removeFromFavorites(bookId);
      } else {
        await addToFavorites(bookId);
      }
    };
    const markAsRead = async (bookId) => {
      try {
        const response = await safeApiCall(
          () => props.api.post(getApiUrl(`/book/readstate/${bookId}`), { read_state: 2 })
        );
        if (response && response.code === 200) {
          showToast("已标记为已读", "success");
          readingBooks.value = readingBooks.value.filter((b) => b.id !== bookId);
        } else {
          showToast(`设置失败: ${response?.message}`, "error");
        }
      } catch (error) {
        log.error("Reading", "❌ 标记已读失败", error);
        showToast("标记已读失败", "error");
      }
    };
    const showBookDetail = async (bookId) => {
      log.info("Detail", `开始获取书籍详情 (ID: ${bookId})`);
      try {
        const startTime = Date.now();
        const response = await safeApiCall(
          () => props.api.get(getApiUrl(`/book/detail/${bookId}`))
        );
        const duration = Date.now() - startTime;
        log.debug("Detail", `请求完成 (${duration}ms)`, response);
        let bookData = null;
        if (response && response.code === 200) {
          bookData = response.data;
          log.info("Detail", "✅ 获取详情成功");
        } else if (response && typeof response === "object" && !Array.isArray(response)) {
          bookData = response;
          log.info("Detail", "✅ 获取详情成功（旧格式）");
        } else {
          log.warn("Detail", "⚠️ 获取书籍详情失败", {
            code: response?.code,
            message: response?.message
          });
        }
        if (bookData) {
          selectedBook.value = bookData;
          detailDialog.value = true;
          log.debug("Detail", "打开详情对话框");
        }
      } catch (error) {
        log.error("Detail", "❌ 获取书籍详情失败", error);
        showToast(`获取详情失败: ${error instanceof Error ? error.message : "未知错误"}`, "error");
      }
    };
    const downloadBook = async (bookId) => {
      downloadingBook.value = bookId;
      try {
        const response = await safeApiCall(
          () => props.api.post(getApiUrl("/action"), {
            action: "download",
            book_id: bookId,
            format: "epub"
          })
        );
        console.log("下载响应:", response);
        if (response && response.code === 200) {
          showToast(`✅ 下载成功: ${response.data.filepath}`, "success");
        } else {
          showToast(`❌ 下载失败: ${response?.message || "未知错误"}`, "error");
        }
      } catch (error) {
        console.error("下载失败:", error);
        showToast("❌ 下载失败,请检查控制台日志", "error");
      } finally {
        downloadingBook.value = null;
      }
    };
    onMounted(async () => {
      console.log("[Page] ========== 组件挂载 ==========");
      console.log("[Page] props.model:", props.model);
      await loadConfig();
      console.log("[Page] server_url:", talebookServerUrl.value || "未配置");
      console.log("[Page] ================================");
      loadRecentBooks();
    });
    watch(activeTab, (newTab, oldTab) => {
      log.info("Tab", `标签页切换: ${oldTab} -> ${newTab}`);
      if (newTab === "favorites") {
        if (favoriteBooks.value.length === 0 && !loadingFavorites.value) {
          loadFavoriteBooks();
        }
      } else if (newTab === "reading") {
        if (readingBooks.value.length === 0 && !loadingReading.value) {
          loadReadingBooks();
        }
      }
    });
    return (_ctx, _cache) => {
      const _component_v_icon = _resolveComponent("v-icon");
      const _component_v_card_title = _resolveComponent("v-card-title");
      const _component_v_card_subtitle = _resolveComponent("v-card-subtitle");
      const _component_v_card = _resolveComponent("v-card");
      const _component_v_tab = _resolveComponent("v-tab");
      const _component_v_tabs = _resolveComponent("v-tabs");
      const _component_v_window_item = _resolveComponent("v-window-item");
      const _component_v_alert = _resolveComponent("v-alert");
      const _component_v_text_field = _resolveComponent("v-text-field");
      const _component_v_col = _resolveComponent("v-col");
      const _component_v_btn = _resolveComponent("v-btn");
      const _component_v_row = _resolveComponent("v-row");
      const _component_v_card_text = _resolveComponent("v-card-text");
      const _component_v_empty_state = _resolveComponent("v-empty-state");
      const _component_v_chip = _resolveComponent("v-chip");
      const _component_v_spacer = _resolveComponent("v-spacer");
      const _component_v_window = _resolveComponent("v-window");
      const _component_v_container = _resolveComponent("v-container");
      return _openBlock(), _createBlock(_component_v_container, {
        fluid: "",
        class: "pa-4"
      }, {
        default: _withCtx(() => [
          _createVNode(_component_v_card, { class: "mb-6 elevation-4" }, {
            default: _withCtx(() => [
              _createVNode(_component_v_card_title, { class: "text-h5 bg-primary text-white d-flex align-center py-4" }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_icon, {
                    start: "",
                    color: "white"
                  }, {
                    default: _withCtx(() => [..._cache[6] || (_cache[6] = [
                      _createTextVNode("mdi-book-open-page-variant", -1)
                    ])]),
                    _: 1
                  }),
                  _cache[7] || (_cache[7] = _createTextVNode(" Talebook 本地书库管理 ", -1))
                ]),
                _: 1
              }),
              _createVNode(_component_v_card_subtitle, { class: "text-grey-darken-1 pa-3" }, {
                default: _withCtx(() => [..._cache[8] || (_cache[8] = [
                  _createTextVNode(" 扫描本地目录，批量导入小说到 Talebook 书库（与 Sonovel 联动） ", -1)
                ])]),
                _: 1
              })
            ]),
            _: 1
          }),
          _createVNode(_component_v_card, { class: "mb-6 elevation-4" }, {
            default: _withCtx(() => [
              _createVNode(_component_v_tabs, {
                modelValue: activeTab.value,
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => activeTab.value = $event),
                color: "primary",
                grow: ""
              }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_tab, { value: "scan" }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_icon, { start: "" }, {
                        default: _withCtx(() => [..._cache[9] || (_cache[9] = [
                          _createTextVNode("mdi-folder-search", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[10] || (_cache[10] = _createTextVNode(" 扫描导入 ", -1))
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_tab, { value: "browse" }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_icon, { start: "" }, {
                        default: _withCtx(() => [..._cache[11] || (_cache[11] = [
                          _createTextVNode("mdi-book-search", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[12] || (_cache[12] = _createTextVNode(" 书籍浏览 ", -1))
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_tab, { value: "recent" }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_icon, { start: "" }, {
                        default: _withCtx(() => [..._cache[13] || (_cache[13] = [
                          _createTextVNode("mdi-history", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[14] || (_cache[14] = _createTextVNode(" 最近添加 ", -1))
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_tab, { value: "favorites" }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_icon, { start: "" }, {
                        default: _withCtx(() => [..._cache[15] || (_cache[15] = [
                          _createTextVNode("mdi-heart", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[16] || (_cache[16] = _createTextVNode(" 我的收藏 ", -1))
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_tab, { value: "reading" }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_icon, { start: "" }, {
                        default: _withCtx(() => [..._cache[17] || (_cache[17] = [
                          _createTextVNode("mdi-book-open-variant", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[18] || (_cache[18] = _createTextVNode(" 正在阅读 ", -1))
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_tab, { value: "meta" }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_icon, { start: "" }, {
                        default: _withCtx(() => [..._cache[19] || (_cache[19] = [
                          _createTextVNode("mdi-tag-multiple", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[20] || (_cache[20] = _createTextVNode(" 元数据分类 ", -1))
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["modelValue"])
            ]),
            _: 1
          }),
          _createVNode(_component_v_window, {
            modelValue: activeTab.value,
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => activeTab.value = $event)
          }, {
            default: _withCtx(() => [
              _createVNode(_component_v_window_item, { value: "scan" }, {
                default: _withCtx(() => [
                  _createVNode(ScanPanel, {
                    scanning: scanning.value,
                    progress: scanProgress.value,
                    onScan: handleScanAndImport,
                    onViewRecent: loadRecentBooks
                  }, null, 8, ["scanning", "progress"])
                ]),
                _: 1
              }),
              _createVNode(_component_v_window_item, { value: "browse" }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_card, { class: "elevation-4" }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_card_title, { class: "text-subtitle-1 py-3" }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_icon, {
                            start: "",
                            color: "primary"
                          }, {
                            default: _withCtx(() => [..._cache[21] || (_cache[21] = [
                              _createTextVNode("mdi-book-search", -1)
                            ])]),
                            _: 1
                          }),
                          _cache[22] || (_cache[22] = _createTextVNode(" 搜索并浏览书籍 ", -1))
                        ]),
                        _: 1
                      }),
                      _createVNode(_component_v_card_text, { class: "pa-5" }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_alert, {
                            type: "info",
                            variant: "tonal",
                            class: "mb-5",
                            border: "start",
                            icon: "mdi-information"
                          }, {
                            default: _withCtx(() => [..._cache[23] || (_cache[23] = [
                              _createElementVNode("div", { class: "text-body-2" }, [
                                _createElementVNode("strong", null, "功能说明："),
                                _createElementVNode("br"),
                                _createTextVNode(" • 支持按书名、作者或标签搜索"),
                                _createElementVNode("br"),
                                _createTextVNode(" • 点击卡片查看详情或直接下载"),
                                _createElementVNode("br"),
                                _createTextVNode(" • 支持多种格式：.epub、.mobi、.pdf ")
                              ], -1)
                            ])]),
                            _: 1
                          }),
                          _createVNode(_component_v_row, { class: "mb-4" }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_col, {
                                cols: "12",
                                md: "8"
                              }, {
                                default: _withCtx(() => [
                                  _createVNode(_component_v_text_field, {
                                    modelValue: searchKeyword.value,
                                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => searchKeyword.value = $event),
                                    label: "搜索书籍",
                                    "prepend-inner-icon": "mdi-magnify",
                                    placeholder: "输入书名、作者或标签",
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
                                    onClick: handleSearch
                                  }, {
                                    default: _withCtx(() => [..._cache[24] || (_cache[24] = [
                                      _createTextVNode(" 搜索 ", -1)
                                    ])]),
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
                      })
                    ]),
                    _: 1
                  }),
                  books.value.length > 0 && searched.value ? (_openBlock(), _createBlock(_sfc_main$5, {
                    key: 0,
                    books: books.value,
                    title: listTitle.value,
                    icon: "mdi-bookshelf",
                    "favorite-book-ids": favoriteBookIds.value,
                    "downloading-book-id": downloadingBook.value,
                    "get-cover-url": getCoverUrl,
                    onDetail: showBookDetail,
                    onToggleFavorite: toggleFavorite,
                    onDownload: downloadBook
                  }, null, 8, ["books", "title", "favorite-book-ids", "downloading-book-id"])) : !loading.value && searched.value ? (_openBlock(), _createBlock(_component_v_empty_state, {
                    key: 1,
                    icon: "mdi-book-off-outline",
                    title: "没有找到书籍",
                    text: "尝试其他关键词或查看最近添加的书籍",
                    class: "mt-8"
                  })) : _createCommentVNode("", true)
                ]),
                _: 1
              }),
              _createVNode(_component_v_window_item, { value: "recent" }, {
                default: _withCtx(() => [
                  _createVNode(_sfc_main$5, {
                    books: books.value,
                    title: "最近添加的书籍",
                    icon: "mdi-history",
                    "favorite-book-ids": favoriteBookIds.value,
                    "downloading-book-id": downloadingBook.value,
                    loading: loading.value,
                    "get-cover-url": getCoverUrl,
                    onDetail: showBookDetail,
                    onToggleFavorite: toggleFavorite,
                    onDownload: downloadBook
                  }, null, 8, ["books", "favorite-book-ids", "downloading-book-id", "loading"]),
                  !loading.value && books.value.length === 0 ? (_openBlock(), _createBlock(_component_v_empty_state, {
                    key: 0,
                    icon: "mdi-book-off-outline",
                    title: "暂无书籍",
                    text: "请先扫描导入或等待新添加的书籍",
                    class: "mt-8"
                  })) : _createCommentVNode("", true)
                ]),
                _: 1
              }),
              _createVNode(_component_v_window_item, { value: "favorites" }, {
                default: _withCtx(() => [
                  _createVNode(_sfc_main$5, {
                    books: favoriteBooks.value,
                    title: "我的收藏",
                    icon: "mdi-heart",
                    "favorite-book-ids": favoriteBookIds.value,
                    loading: loadingFavorites.value,
                    "show-refresh": "",
                    "show-favorite": false,
                    "get-cover-url": getCoverUrl,
                    onDetail: showBookDetail,
                    onDownload: downloadBook,
                    onRefresh: loadFavoriteBooks
                  }, {
                    badge: _withCtx(() => [
                      _createVNode(_component_v_chip, {
                        position: "absolute",
                        top: "8",
                        right: "8",
                        color: "red",
                        size: "x-small",
                        "prepend-icon": "mdi-heart",
                        variant: "flat"
                      }, {
                        default: _withCtx(() => [..._cache[25] || (_cache[25] = [
                          _createTextVNode(" 收藏 ", -1)
                        ])]),
                        _: 1
                      })
                    ]),
                    actions: _withCtx(({ book }) => [
                      _createVNode(_component_v_btn, {
                        size: "x-small",
                        variant: "tonal",
                        color: "primary",
                        "prepend-icon": "mdi-information-outline",
                        onClick: ($event) => showBookDetail(book.id)
                      }, {
                        default: _withCtx(() => [..._cache[26] || (_cache[26] = [
                          _createTextVNode(" 详情 ", -1)
                        ])]),
                        _: 1
                      }, 8, ["onClick"]),
                      _createVNode(_component_v_spacer),
                      _createVNode(_component_v_btn, {
                        size: "x-small",
                        color: "error",
                        variant: "tonal",
                        "prepend-icon": "mdi-heart-off",
                        onClick: ($event) => removeFromFavorites(book.id)
                      }, {
                        default: _withCtx(() => [..._cache[27] || (_cache[27] = [
                          _createTextVNode(" 取消收藏 ", -1)
                        ])]),
                        _: 1
                      }, 8, ["onClick"])
                    ]),
                    _: 1
                  }, 8, ["books", "favorite-book-ids", "loading"]),
                  !loadingFavorites.value && favoriteBooks.value.length === 0 ? (_openBlock(), _createBlock(_component_v_empty_state, {
                    key: 0,
                    icon: "mdi-heart-off-outline",
                    title: "暂无收藏",
                    text: "浏览书籍并点击收藏按钮添加到我的收藏",
                    class: "mt-8"
                  })) : _createCommentVNode("", true)
                ]),
                _: 1
              }),
              _createVNode(_component_v_window_item, { value: "reading" }, {
                default: _withCtx(() => [
                  _createVNode(_sfc_main$5, {
                    books: readingBooks.value,
                    title: "正在阅读",
                    icon: "mdi-book-open-variant",
                    "favorite-book-ids": favoriteBookIds.value,
                    loading: loadingReading.value,
                    "show-refresh": "",
                    "show-favorite": false,
                    "get-cover-url": getCoverUrl,
                    onDetail: showBookDetail,
                    onDownload: downloadBook,
                    onRefresh: loadReadingBooks
                  }, {
                    badge: _withCtx(() => [
                      _createVNode(_component_v_chip, {
                        position: "absolute",
                        top: "8",
                        right: "8",
                        color: "blue",
                        size: "x-small",
                        "prepend-icon": "mdi-book-open-page-variant",
                        variant: "flat"
                      }, {
                        default: _withCtx(() => [..._cache[28] || (_cache[28] = [
                          _createTextVNode(" 在读 ", -1)
                        ])]),
                        _: 1
                      })
                    ]),
                    actions: _withCtx(({ book }) => [
                      _createVNode(_component_v_btn, {
                        size: "x-small",
                        variant: "tonal",
                        color: "primary",
                        "prepend-icon": "mdi-information-outline",
                        onClick: ($event) => showBookDetail(book.id)
                      }, {
                        default: _withCtx(() => [..._cache[29] || (_cache[29] = [
                          _createTextVNode(" 详情 ", -1)
                        ])]),
                        _: 1
                      }, 8, ["onClick"]),
                      _createVNode(_component_v_spacer),
                      _createVNode(_component_v_btn, {
                        size: "x-small",
                        color: "success",
                        variant: "tonal",
                        "prepend-icon": "mdi-check-circle",
                        onClick: ($event) => markAsRead(book.id)
                      }, {
                        default: _withCtx(() => [..._cache[30] || (_cache[30] = [
                          _createTextVNode(" 标记已读 ", -1)
                        ])]),
                        _: 1
                      }, 8, ["onClick"])
                    ]),
                    _: 1
                  }, 8, ["books", "favorite-book-ids", "loading"]),
                  !loadingReading.value && readingBooks.value.length === 0 ? (_openBlock(), _createBlock(_component_v_empty_state, {
                    key: 0,
                    icon: "mdi-book-off-outline",
                    title: "暂无在读",
                    text: "浏览书籍并设置阅读状态为“在读”",
                    class: "mt-8"
                  })) : _createCommentVNode("", true)
                ]),
                _: 1
              }),
              _createVNode(_component_v_window_item, { value: "meta" }, {
                default: _withCtx(() => [
                  _createVNode(MetaCategory, { api: __props.api }, null, 8, ["api"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["modelValue"]),
          _createVNode(BookDetailDialog, {
            modelValue: detailDialog.value,
            "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => detailDialog.value = $event),
            book: selectedBook.value,
            "cover-url": selectedBook.value ? getDetailCoverUrl(selectedBook.value) : "",
            "is-favorited": selectedBook.value ? favoriteBooks.value.some((b) => b.id === selectedBook.value.id) : false,
            "is-downloading": downloadingBook.value === selectedBook.value?.id,
            onToggleFavorite: _cache[4] || (_cache[4] = ($event) => selectedBook.value && toggleFavorite(selectedBook.value.id)),
            onDownload: _cache[5] || (_cache[5] = ($event) => selectedBook.value && downloadBook(selectedBook.value.id))
          }, null, 8, ["modelValue", "book", "cover-url", "is-favorited", "is-downloading"]),
          _createVNode(_sfc_main$2)
        ]),
        _: 1
      });
    };
  }
});

const Page = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d9695abd"]]);

export { Page as default };
