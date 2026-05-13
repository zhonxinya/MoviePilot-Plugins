import { importShared } from './__federation_fn_import-DxkyMxrD.js';
import { _ as _export_sfc } from './_plugin-vue_export-helper-pcqpp-6-.js';

const {defineComponent:_defineComponent$3} = await importShared('vue');

const {createTextVNode:_createTextVNode$3,resolveComponent:_resolveComponent$3,withCtx:_withCtx$3,createVNode:_createVNode$3,createElementVNode:_createElementVNode$3,openBlock:_openBlock$3,createBlock:_createBlock$3,createCommentVNode:_createCommentVNode$2,toDisplayString:_toDisplayString$2,renderList:_renderList$2,Fragment:_Fragment$2,createElementBlock:_createElementBlock$2} = await importShared('vue');

const {ref: ref$3,onMounted: onMounted$2} = await importShared('vue');

const _sfc_main$3 = /* @__PURE__ */ _defineComponent$3({
  __name: "LibrariesPanel",
  props: {
    api: {
      type: Object,
      default: () => ({})
    }
  },
  setup(__props) {
    const props = __props;
    const loading = ref$3(false);
    const error = ref$3("");
    const libraries = ref$3([]);
    async function loadLibraries() {
      loading.value = true;
      error.value = "";
      try {
        const response = await props.api.get("plugin/Audiobookshelf/libraries");
        if (response.code === 200) {
          libraries.value = response.data?.libraries || [];
        } else {
          error.value = response.message || "加载失败";
        }
      } catch (err) {
        console.error("加载库列表失败:", err);
        error.value = err.message || "网络错误";
      } finally {
        loading.value = false;
      }
    }
    function getLibraryIcon(icon) {
      const iconMap = {
        "audiobookshelf": "mdi-bookshelf",
        "book": "mdi-book",
        "podcast": "mdi-podcast",
        "music": "mdi-music",
        "video": "mdi-video"
      };
      return iconMap[icon] || "mdi-library";
    }
    function viewLibraryItems(libraryId) {
      console.log("查看库项目:", libraryId);
    }
    function viewAuthors(libraryId) {
      console.log("查看作者:", libraryId);
    }
    onMounted$2(() => {
      loadLibraries();
    });
    return (_ctx, _cache) => {
      const _component_v_icon = _resolveComponent$3("v-icon");
      const _component_v_btn = _resolveComponent$3("v-btn");
      const _component_v_card_title = _resolveComponent$3("v-card-title");
      const _component_v_divider = _resolveComponent$3("v-divider");
      const _component_v_progress_linear = _resolveComponent$3("v-progress-linear");
      const _component_v_alert = _resolveComponent$3("v-alert");
      const _component_v_chip = _resolveComponent$3("v-chip");
      const _component_v_card_subtitle = _resolveComponent$3("v-card-subtitle");
      const _component_v_spacer = _resolveComponent$3("v-spacer");
      const _component_v_card_actions = _resolveComponent$3("v-card-actions");
      const _component_v_card = _resolveComponent$3("v-card");
      const _component_v_col = _resolveComponent$3("v-col");
      const _component_v_row = _resolveComponent$3("v-row");
      const _component_v_empty_state = _resolveComponent$3("v-empty-state");
      const _component_v_card_text = _resolveComponent$3("v-card-text");
      return _openBlock$3(), _createBlock$3(_component_v_card, { elevation: "4" }, {
        default: _withCtx$3(() => [
          _createVNode$3(_component_v_card_title, { class: "text-subtitle-1 py-3 d-flex align-center justify-space-between" }, {
            default: _withCtx$3(() => [
              _createElementVNode$3("div", null, [
                _createVNode$3(_component_v_icon, {
                  start: "",
                  color: "primary"
                }, {
                  default: _withCtx$3(() => [..._cache[1] || (_cache[1] = [
                    _createTextVNode$3("mdi-library", -1)
                  ])]),
                  _: 1
                }),
                _cache[2] || (_cache[2] = _createTextVNode$3(" 库列表 ", -1))
              ]),
              _createVNode$3(_component_v_btn, {
                color: "primary",
                "prepend-icon": "mdi-refresh",
                loading: loading.value,
                onClick: loadLibraries
              }, {
                default: _withCtx$3(() => [..._cache[3] || (_cache[3] = [
                  _createTextVNode$3(" 刷新 ", -1)
                ])]),
                _: 1
              }, 8, ["loading"])
            ]),
            _: 1
          }),
          _createVNode$3(_component_v_divider),
          _createVNode$3(_component_v_card_text, null, {
            default: _withCtx$3(() => [
              loading.value ? (_openBlock$3(), _createBlock$3(_component_v_progress_linear, {
                key: 0,
                indeterminate: "",
                color: "primary"
              })) : _createCommentVNode$2("", true),
              error.value ? (_openBlock$3(), _createBlock$3(_component_v_alert, {
                key: 1,
                type: "error",
                variant: "tonal",
                closable: "",
                "onClick:close": _cache[0] || (_cache[0] = ($event) => error.value = "")
              }, {
                default: _withCtx$3(() => [
                  _createTextVNode$3(_toDisplayString$2(error.value), 1)
                ]),
                _: 1
              })) : _createCommentVNode$2("", true),
              !loading.value && libraries.value.length > 0 ? (_openBlock$3(), _createBlock$3(_component_v_row, { key: 2 }, {
                default: _withCtx$3(() => [
                  (_openBlock$3(true), _createElementBlock$2(_Fragment$2, null, _renderList$2(libraries.value, (library) => {
                    return _openBlock$3(), _createBlock$3(_component_v_col, {
                      key: library.id,
                      cols: "12",
                      md: "6",
                      lg: "4"
                    }, {
                      default: _withCtx$3(() => [
                        _createVNode$3(_component_v_card, {
                          variant: "outlined",
                          hover: ""
                        }, {
                          default: _withCtx$3(() => [
                            _createVNode$3(_component_v_card_title, { class: "d-flex align-center" }, {
                              default: _withCtx$3(() => [
                                _createVNode$3(_component_v_icon, {
                                  start: "",
                                  color: "primary"
                                }, {
                                  default: _withCtx$3(() => [
                                    _createTextVNode$3(_toDisplayString$2(getLibraryIcon(library.icon)), 1)
                                  ]),
                                  _: 2
                                }, 1024),
                                _createTextVNode$3(" " + _toDisplayString$2(library.name), 1)
                              ]),
                              _: 2
                            }, 1024),
                            _createVNode$3(_component_v_card_subtitle, null, {
                              default: _withCtx$3(() => [
                                _createVNode$3(_component_v_chip, {
                                  size: "small",
                                  color: "primary",
                                  class: "mr-2"
                                }, {
                                  default: _withCtx$3(() => [
                                    _createTextVNode$3(_toDisplayString$2(library.mediaType === "book" ? "有声书" : "播客"), 1)
                                  ]),
                                  _: 2
                                }, 1024),
                                _createVNode$3(_component_v_chip, {
                                  size: "small",
                                  variant: "outlined"
                                }, {
                                  default: _withCtx$3(() => [
                                    _createTextVNode$3(_toDisplayString$2(library.folders?.length || 0) + " 个文件夹 ", 1)
                                  ]),
                                  _: 2
                                }, 1024)
                              ]),
                              _: 2
                            }, 1024),
                            _createVNode$3(_component_v_card_actions, null, {
                              default: _withCtx$3(() => [
                                _createVNode$3(_component_v_spacer),
                                _createVNode$3(_component_v_btn, {
                                  size: "small",
                                  variant: "text",
                                  "prepend-icon": "mdi-book-search",
                                  onClick: ($event) => viewLibraryItems(library.id)
                                }, {
                                  default: _withCtx$3(() => [..._cache[4] || (_cache[4] = [
                                    _createTextVNode$3(" 浏览项目 ", -1)
                                  ])]),
                                  _: 1
                                }, 8, ["onClick"]),
                                _createVNode$3(_component_v_btn, {
                                  size: "small",
                                  variant: "text",
                                  "prepend-icon": "mdi-account-multiple",
                                  onClick: ($event) => viewAuthors(library.id)
                                }, {
                                  default: _withCtx$3(() => [..._cache[5] || (_cache[5] = [
                                    _createTextVNode$3(" 作者 ", -1)
                                  ])]),
                                  _: 1
                                }, 8, ["onClick"])
                              ]),
                              _: 2
                            }, 1024)
                          ]),
                          _: 2
                        }, 1024)
                      ]),
                      _: 2
                    }, 1024);
                  }), 128))
                ]),
                _: 1
              })) : _createCommentVNode$2("", true),
              !loading.value && libraries.value.length === 0 && !error.value ? (_openBlock$3(), _createBlock$3(_component_v_empty_state, {
                key: 3,
                icon: "mdi-library",
                title: "暂无库",
                text: "请先在 Audiobookshelf 中创建库"
              })) : _createCommentVNode$2("", true)
            ]),
            _: 1
          })
        ]),
        _: 1
      });
    };
  }
});

const {defineComponent:_defineComponent$2} = await importShared('vue');

const {createTextVNode:_createTextVNode$2,resolveComponent:_resolveComponent$2,withCtx:_withCtx$2,createVNode:_createVNode$2,createElementVNode:_createElementVNode$2,openBlock:_openBlock$2,createBlock:_createBlock$2,createCommentVNode:_createCommentVNode$1,toDisplayString:_toDisplayString$1,renderList:_renderList$1,Fragment:_Fragment$1,createElementBlock:_createElementBlock$1} = await importShared('vue');

const {ref: ref$2,onMounted: onMounted$1} = await importShared('vue');

const _sfc_main$2 = /* @__PURE__ */ _defineComponent$2({
  __name: "AuthorsPanel",
  props: {
    api: {
      type: Object,
      default: () => ({})
    }
  },
  setup(__props) {
    const props = __props;
    const loading = ref$2(false);
    const error = ref$2("");
    const selectedLibrary = ref$2("");
    const libraryOptions = ref$2([]);
    const authors = ref$2([]);
    async function loadLibraries() {
      try {
        const response = await props.api.get("plugin/Audiobookshelf/libraries");
        if (response.code === 200) {
          const libraries = response.data?.libraries || [];
          libraryOptions.value = libraries.map((lib) => ({
            title: lib.name,
            value: lib.id
          }));
          if (libraries.length > 0 && !selectedLibrary.value) {
            selectedLibrary.value = libraries[0].id;
            loadAuthors();
          }
        }
      } catch (err) {
        console.error("加载库列表失败:", err);
      }
    }
    async function loadAuthors() {
      if (!selectedLibrary.value) {
        authors.value = [];
        return;
      }
      loading.value = true;
      error.value = "";
      try {
        const response = await props.api.get(`plugin/Audiobookshelf/authors`, {
          params: { library_id: selectedLibrary.value }
        });
        if (response.code === 200) {
          authors.value = response.data?.authors || [];
        } else {
          error.value = response.message || "加载失败";
        }
      } catch (err) {
        console.error("加载作者列表失败:", err);
        error.value = err.message || "网络错误";
      } finally {
        loading.value = false;
      }
    }
    function viewAuthorDetail(authorId) {
      console.log("查看作者详情:", authorId);
    }
    onMounted$1(() => {
      loadLibraries();
    });
    return (_ctx, _cache) => {
      const _component_v_icon = _resolveComponent$2("v-icon");
      const _component_v_select = _resolveComponent$2("v-select");
      const _component_v_btn = _resolveComponent$2("v-btn");
      const _component_v_card_title = _resolveComponent$2("v-card-title");
      const _component_v_divider = _resolveComponent$2("v-divider");
      const _component_v_progress_linear = _resolveComponent$2("v-progress-linear");
      const _component_v_alert = _resolveComponent$2("v-alert");
      const _component_v_avatar = _resolveComponent$2("v-avatar");
      const _component_v_list_item_title = _resolveComponent$2("v-list-item-title");
      const _component_v_chip = _resolveComponent$2("v-chip");
      const _component_v_list_item_subtitle = _resolveComponent$2("v-list-item-subtitle");
      const _component_v_list_item = _resolveComponent$2("v-list-item");
      const _component_v_spacer = _resolveComponent$2("v-spacer");
      const _component_v_card_actions = _resolveComponent$2("v-card-actions");
      const _component_v_card = _resolveComponent$2("v-card");
      const _component_v_col = _resolveComponent$2("v-col");
      const _component_v_row = _resolveComponent$2("v-row");
      const _component_v_empty_state = _resolveComponent$2("v-empty-state");
      const _component_v_card_text = _resolveComponent$2("v-card-text");
      return _openBlock$2(), _createBlock$2(_component_v_card, { elevation: "4" }, {
        default: _withCtx$2(() => [
          _createVNode$2(_component_v_card_title, { class: "text-subtitle-1 py-3 d-flex align-center justify-space-between" }, {
            default: _withCtx$2(() => [
              _createElementVNode$2("div", null, [
                _createVNode$2(_component_v_icon, {
                  start: "",
                  color: "primary"
                }, {
                  default: _withCtx$2(() => [..._cache[2] || (_cache[2] = [
                    _createTextVNode$2("mdi-account-multiple", -1)
                  ])]),
                  _: 1
                }),
                _cache[3] || (_cache[3] = _createTextVNode$2(" 作者管理 ", -1))
              ]),
              _createElementVNode$2("div", null, [
                _createVNode$2(_component_v_select, {
                  modelValue: selectedLibrary.value,
                  "onUpdate:modelValue": [
                    _cache[0] || (_cache[0] = ($event) => selectedLibrary.value = $event),
                    loadAuthors
                  ],
                  items: libraryOptions.value,
                  label: "选择库",
                  variant: "outlined",
                  density: "compact",
                  style: { "width": "200px", "display": "inline-block" }
                }, null, 8, ["modelValue", "items"]),
                _createVNode$2(_component_v_btn, {
                  class: "ml-2",
                  color: "primary",
                  "prepend-icon": "mdi-refresh",
                  loading: loading.value,
                  onClick: loadAuthors
                }, {
                  default: _withCtx$2(() => [..._cache[4] || (_cache[4] = [
                    _createTextVNode$2(" 刷新 ", -1)
                  ])]),
                  _: 1
                }, 8, ["loading"])
              ])
            ]),
            _: 1
          }),
          _createVNode$2(_component_v_divider),
          _createVNode$2(_component_v_card_text, null, {
            default: _withCtx$2(() => [
              loading.value ? (_openBlock$2(), _createBlock$2(_component_v_progress_linear, {
                key: 0,
                indeterminate: "",
                color: "primary"
              })) : _createCommentVNode$1("", true),
              error.value ? (_openBlock$2(), _createBlock$2(_component_v_alert, {
                key: 1,
                type: "error",
                variant: "tonal",
                closable: "",
                "onClick:close": _cache[1] || (_cache[1] = ($event) => error.value = "")
              }, {
                default: _withCtx$2(() => [
                  _createTextVNode$2(_toDisplayString$1(error.value), 1)
                ]),
                _: 1
              })) : _createCommentVNode$1("", true),
              !loading.value && authors.value.length > 0 ? (_openBlock$2(), _createBlock$2(_component_v_row, { key: 2 }, {
                default: _withCtx$2(() => [
                  (_openBlock$2(true), _createElementBlock$1(_Fragment$1, null, _renderList$1(authors.value, (author) => {
                    return _openBlock$2(), _createBlock$2(_component_v_col, {
                      key: author.id,
                      cols: "12",
                      md: "6",
                      lg: "4"
                    }, {
                      default: _withCtx$2(() => [
                        _createVNode$2(_component_v_card, {
                          variant: "outlined",
                          hover: ""
                        }, {
                          default: _withCtx$2(() => [
                            _createVNode$2(_component_v_list_item, null, {
                              prepend: _withCtx$2(() => [
                                _createVNode$2(_component_v_avatar, { size: "60" }, {
                                  default: _withCtx$2(() => [
                                    _createVNode$2(_component_v_icon, {
                                      size: "40",
                                      color: "grey"
                                    }, {
                                      default: _withCtx$2(() => [..._cache[5] || (_cache[5] = [
                                        _createTextVNode$2("mdi-account", -1)
                                      ])]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ]),
                              default: _withCtx$2(() => [
                                _createVNode$2(_component_v_list_item_title, { class: "font-weight-bold" }, {
                                  default: _withCtx$2(() => [
                                    _createTextVNode$2(_toDisplayString$1(author.name), 1)
                                  ]),
                                  _: 2
                                }, 1024),
                                _createVNode$2(_component_v_list_item_subtitle, null, {
                                  default: _withCtx$2(() => [
                                    _createVNode$2(_component_v_chip, {
                                      size: "x-small",
                                      color: "primary",
                                      class: "mr-1"
                                    }, {
                                      default: _withCtx$2(() => [
                                        _createTextVNode$2(_toDisplayString$1(author.numBooks || 0) + " 本书 ", 1)
                                      ]),
                                      _: 2
                                    }, 1024)
                                  ]),
                                  _: 2
                                }, 1024)
                              ]),
                              _: 2
                            }, 1024),
                            _createVNode$2(_component_v_card_actions, null, {
                              default: _withCtx$2(() => [
                                _createVNode$2(_component_v_spacer),
                                _createVNode$2(_component_v_btn, {
                                  size: "small",
                                  variant: "text",
                                  "prepend-icon": "mdi-information",
                                  onClick: ($event) => viewAuthorDetail(author.id)
                                }, {
                                  default: _withCtx$2(() => [..._cache[6] || (_cache[6] = [
                                    _createTextVNode$2(" 详情 ", -1)
                                  ])]),
                                  _: 1
                                }, 8, ["onClick"])
                              ]),
                              _: 2
                            }, 1024)
                          ]),
                          _: 2
                        }, 1024)
                      ]),
                      _: 2
                    }, 1024);
                  }), 128))
                ]),
                _: 1
              })) : _createCommentVNode$1("", true),
              !loading.value && authors.value.length === 0 && !error.value ? (_openBlock$2(), _createBlock$2(_component_v_empty_state, {
                key: 3,
                icon: "mdi-account-multiple",
                title: "暂无作者",
                text: "请先选择一个库"
              })) : _createCommentVNode$1("", true)
            ]),
            _: 1
          })
        ]),
        _: 1
      });
    };
  }
});

const {defineComponent:_defineComponent$1} = await importShared('vue');

const {createTextVNode:_createTextVNode$1,resolveComponent:_resolveComponent$1,withCtx:_withCtx$1,createVNode:_createVNode$1,createElementVNode:_createElementVNode$1,openBlock:_openBlock$1,createBlock:_createBlock$1,createCommentVNode:_createCommentVNode,toDisplayString:_toDisplayString,renderList:_renderList,Fragment:_Fragment,createElementBlock:_createElementBlock} = await importShared('vue');

const {ref: ref$1,onMounted} = await importShared('vue');

const _sfc_main$1 = /* @__PURE__ */ _defineComponent$1({
  __name: "PodcastsPanel",
  props: {
    api: {
      type: Object,
      default: () => ({})
    }
  },
  setup(__props) {
    const props = __props;
    const loading = ref$1(false);
    const error = ref$1("");
    const selectedLibrary = ref$1("");
    const libraryOptions = ref$1([]);
    const podcasts = ref$1([]);
    async function loadLibraries() {
      try {
        const response = await props.api.get("plugin/Audiobookshelf/libraries");
        if (response.code === 200) {
          const libraries = response.data?.libraries || [];
          const podcastLibraries = libraries.filter((lib) => lib.mediaType === "podcast");
          libraryOptions.value = podcastLibraries.map((lib) => ({
            title: lib.name,
            value: lib.id
          }));
          if (podcastLibraries.length > 0 && !selectedLibrary.value) {
            selectedLibrary.value = podcastLibraries[0].id;
            loadPodcasts();
          }
        }
      } catch (err) {
        console.error("加载库列表失败:", err);
      }
    }
    async function loadPodcasts() {
      if (!selectedLibrary.value) {
        podcasts.value = [];
        return;
      }
      loading.value = true;
      error.value = "";
      try {
        const response = await props.api.get(`plugin/Audiobookshelf/library/${selectedLibrary.value}/items`);
        if (response.code === 200) {
          const items = response.data?.results || [];
          podcasts.value = items.filter((item) => item.mediaType === "podcast");
        } else {
          error.value = response.message || "加载失败";
        }
      } catch (err) {
        console.error("加载播客列表失败:", err);
        error.value = err.message || "网络错误";
      } finally {
        loading.value = false;
      }
    }
    async function checkNewEpisodes(podcastId) {
      try {
        const response = await props.api.get(`plugin/Audiobookshelf/podcast/${podcastId}/checknew`);
        if (response.code === 200) {
          const episodes = response.data?.episodes || [];
          alert(`成功下载 ${episodes.length} 个新剧集`);
          loadPodcasts();
        } else {
          alert(response.message || "检查失败");
        }
      } catch (err) {
        console.error("检查新剧集失败:", err);
        alert(err.message || "网络错误");
      }
    }
    onMounted(() => {
      loadLibraries();
    });
    return (_ctx, _cache) => {
      const _component_v_icon = _resolveComponent$1("v-icon");
      const _component_v_select = _resolveComponent$1("v-select");
      const _component_v_btn = _resolveComponent$1("v-btn");
      const _component_v_card_title = _resolveComponent$1("v-card-title");
      const _component_v_divider = _resolveComponent$1("v-divider");
      const _component_v_progress_linear = _resolveComponent$1("v-progress-linear");
      const _component_v_alert = _resolveComponent$1("v-alert");
      const _component_v_avatar = _resolveComponent$1("v-avatar");
      const _component_v_list_item_title = _resolveComponent$1("v-list-item-title");
      const _component_v_chip = _resolveComponent$1("v-chip");
      const _component_v_list_item_subtitle = _resolveComponent$1("v-list-item-subtitle");
      const _component_v_list_item = _resolveComponent$1("v-list-item");
      const _component_v_spacer = _resolveComponent$1("v-spacer");
      const _component_v_card_actions = _resolveComponent$1("v-card-actions");
      const _component_v_card = _resolveComponent$1("v-card");
      const _component_v_col = _resolveComponent$1("v-col");
      const _component_v_row = _resolveComponent$1("v-row");
      const _component_v_empty_state = _resolveComponent$1("v-empty-state");
      const _component_v_card_text = _resolveComponent$1("v-card-text");
      return _openBlock$1(), _createBlock$1(_component_v_card, { elevation: "4" }, {
        default: _withCtx$1(() => [
          _createVNode$1(_component_v_card_title, { class: "text-subtitle-1 py-3 d-flex align-center justify-space-between" }, {
            default: _withCtx$1(() => [
              _createElementVNode$1("div", null, [
                _createVNode$1(_component_v_icon, {
                  start: "",
                  color: "primary"
                }, {
                  default: _withCtx$1(() => [..._cache[2] || (_cache[2] = [
                    _createTextVNode$1("mdi-podcast", -1)
                  ])]),
                  _: 1
                }),
                _cache[3] || (_cache[3] = _createTextVNode$1(" 播客管理 ", -1))
              ]),
              _createElementVNode$1("div", null, [
                _createVNode$1(_component_v_select, {
                  modelValue: selectedLibrary.value,
                  "onUpdate:modelValue": [
                    _cache[0] || (_cache[0] = ($event) => selectedLibrary.value = $event),
                    loadPodcasts
                  ],
                  items: libraryOptions.value,
                  label: "选择库",
                  variant: "outlined",
                  density: "compact",
                  style: { "width": "200px", "display": "inline-block" }
                }, null, 8, ["modelValue", "items"]),
                _createVNode$1(_component_v_btn, {
                  class: "ml-2",
                  color: "primary",
                  "prepend-icon": "mdi-refresh",
                  loading: loading.value,
                  onClick: loadPodcasts
                }, {
                  default: _withCtx$1(() => [..._cache[4] || (_cache[4] = [
                    _createTextVNode$1(" 刷新 ", -1)
                  ])]),
                  _: 1
                }, 8, ["loading"])
              ])
            ]),
            _: 1
          }),
          _createVNode$1(_component_v_divider),
          _createVNode$1(_component_v_card_text, null, {
            default: _withCtx$1(() => [
              loading.value ? (_openBlock$1(), _createBlock$1(_component_v_progress_linear, {
                key: 0,
                indeterminate: "",
                color: "primary"
              })) : _createCommentVNode("", true),
              error.value ? (_openBlock$1(), _createBlock$1(_component_v_alert, {
                key: 1,
                type: "error",
                variant: "tonal",
                closable: "",
                "onClick:close": _cache[1] || (_cache[1] = ($event) => error.value = "")
              }, {
                default: _withCtx$1(() => [
                  _createTextVNode$1(_toDisplayString(error.value), 1)
                ]),
                _: 1
              })) : _createCommentVNode("", true),
              !loading.value && podcasts.value.length > 0 ? (_openBlock$1(), _createBlock$1(_component_v_row, { key: 2 }, {
                default: _withCtx$1(() => [
                  (_openBlock$1(true), _createElementBlock(_Fragment, null, _renderList(podcasts.value, (podcast) => {
                    return _openBlock$1(), _createBlock$1(_component_v_col, {
                      key: podcast.id,
                      cols: "12",
                      md: "6",
                      lg: "4"
                    }, {
                      default: _withCtx$1(() => [
                        _createVNode$1(_component_v_card, {
                          variant: "outlined",
                          hover: ""
                        }, {
                          default: _withCtx$1(() => [
                            _createVNode$1(_component_v_list_item, null, {
                              prepend: _withCtx$1(() => [
                                _createVNode$1(_component_v_avatar, {
                                  size: "60",
                                  rounded: "0"
                                }, {
                                  default: _withCtx$1(() => [
                                    _createVNode$1(_component_v_icon, {
                                      size: "40",
                                      color: "grey"
                                    }, {
                                      default: _withCtx$1(() => [..._cache[5] || (_cache[5] = [
                                        _createTextVNode$1("mdi-podcast", -1)
                                      ])]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ]),
                              default: _withCtx$1(() => [
                                _createVNode$1(_component_v_list_item_title, { class: "font-weight-bold" }, {
                                  default: _withCtx$1(() => [
                                    _createTextVNode$1(_toDisplayString(podcast.metadata?.title || "未知播客"), 1)
                                  ]),
                                  _: 2
                                }, 1024),
                                _createVNode$1(_component_v_list_item_subtitle, null, {
                                  default: _withCtx$1(() => [
                                    _createVNode$1(_component_v_chip, {
                                      size: "x-small",
                                      color: "primary",
                                      class: "mr-1"
                                    }, {
                                      default: _withCtx$1(() => [
                                        _createTextVNode$1(_toDisplayString(podcast.episodes?.length || 0) + " 集 ", 1)
                                      ]),
                                      _: 2
                                    }, 1024),
                                    _createVNode$1(_component_v_chip, {
                                      size: "x-small",
                                      variant: "outlined"
                                    }, {
                                      default: _withCtx$1(() => [
                                        _createTextVNode$1(_toDisplayString(podcast.metadata?.author || "未知作者"), 1)
                                      ]),
                                      _: 2
                                    }, 1024)
                                  ]),
                                  _: 2
                                }, 1024)
                              ]),
                              _: 2
                            }, 1024),
                            _createVNode$1(_component_v_card_actions, null, {
                              default: _withCtx$1(() => [
                                _createVNode$1(_component_v_spacer),
                                _createVNode$1(_component_v_btn, {
                                  size: "small",
                                  variant: "text",
                                  "prepend-icon": "mdi-download",
                                  onClick: ($event) => checkNewEpisodes(podcast.id)
                                }, {
                                  default: _withCtx$1(() => [..._cache[6] || (_cache[6] = [
                                    _createTextVNode$1(" 检查更新 ", -1)
                                  ])]),
                                  _: 1
                                }, 8, ["onClick"])
                              ]),
                              _: 2
                            }, 1024)
                          ]),
                          _: 2
                        }, 1024)
                      ]),
                      _: 2
                    }, 1024);
                  }), 128))
                ]),
                _: 1
              })) : _createCommentVNode("", true),
              !loading.value && podcasts.value.length === 0 && !error.value ? (_openBlock$1(), _createBlock$1(_component_v_empty_state, {
                key: 3,
                icon: "mdi-podcast",
                title: "暂无播客",
                text: "请先选择一个包含播客的库"
              })) : _createCommentVNode("", true)
            ]),
            _: 1
          })
        ]),
        _: 1
      });
    };
  }
});

const {defineComponent:_defineComponent} = await importShared('vue');

const {createTextVNode:_createTextVNode,resolveComponent:_resolveComponent,withCtx:_withCtx,createVNode:_createVNode,createElementVNode:_createElementVNode,openBlock:_openBlock,createBlock:_createBlock} = await importShared('vue');

const _hoisted_1 = { class: "d-flex align-center" };
const {ref} = await importShared('vue');
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "Page",
  props: {
    api: {
      type: Object,
      default: () => ({})
    }
  },
  setup(__props) {
    const activeTab = ref("libraries");
    function handleClose() {
      window.dispatchEvent(new CustomEvent("plugin-close"));
    }
    return (_ctx, _cache) => {
      const _component_v_icon = _resolveComponent("v-icon");
      const _component_v_btn = _resolveComponent("v-btn");
      const _component_v_card_title = _resolveComponent("v-card-title");
      const _component_v_card_subtitle = _resolveComponent("v-card-subtitle");
      const _component_v_card = _resolveComponent("v-card");
      const _component_v_tab = _resolveComponent("v-tab");
      const _component_v_tabs = _resolveComponent("v-tabs");
      const _component_v_window_item = _resolveComponent("v-window-item");
      const _component_v_window = _resolveComponent("v-window");
      const _component_v_container = _resolveComponent("v-container");
      return _openBlock(), _createBlock(_component_v_container, {
        fluid: "",
        class: "pa-4"
      }, {
        default: _withCtx(() => [
          _createVNode(_component_v_card, { class: "mb-6 elevation-4" }, {
            default: _withCtx(() => [
              _createVNode(_component_v_card_title, { class: "text-h5 bg-primary text-white d-flex align-center justify-space-between py-4 px-6" }, {
                default: _withCtx(() => [
                  _createElementVNode("div", _hoisted_1, [
                    _createVNode(_component_v_icon, {
                      start: "",
                      color: "white",
                      class: "mr-3"
                    }, {
                      default: _withCtx(() => [..._cache[2] || (_cache[2] = [
                        _createTextVNode("mdi-bookshelf", -1)
                      ])]),
                      _: 1
                    }),
                    _cache[3] || (_cache[3] = _createTextVNode(" Audiobookshelf 有声书和播客管理 ", -1))
                  ]),
                  _createVNode(_component_v_btn, {
                    icon: "",
                    variant: "text",
                    color: "white",
                    size: "small",
                    onClick: handleClose,
                    title: "关闭页面"
                  }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_icon, null, {
                        default: _withCtx(() => [..._cache[4] || (_cache[4] = [
                          _createTextVNode("mdi-close", -1)
                        ])]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              _createVNode(_component_v_card_subtitle, { class: "text-grey-darken-1 pa-3" }, {
                default: _withCtx(() => [..._cache[5] || (_cache[5] = [
                  _createTextVNode(" 管理 Audiobookshelf 库、作者、系列和播客 ", -1)
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
                  _createVNode(_component_v_tab, { value: "libraries" }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_icon, { start: "" }, {
                        default: _withCtx(() => [..._cache[6] || (_cache[6] = [
                          _createTextVNode("mdi-library", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[7] || (_cache[7] = _createTextVNode(" 库管理 ", -1))
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_tab, { value: "authors" }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_icon, { start: "" }, {
                        default: _withCtx(() => [..._cache[8] || (_cache[8] = [
                          _createTextVNode("mdi-account-multiple", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[9] || (_cache[9] = _createTextVNode(" 作者管理 ", -1))
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_tab, { value: "podcasts" }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_icon, { start: "" }, {
                        default: _withCtx(() => [..._cache[10] || (_cache[10] = [
                          _createTextVNode("mdi-podcast", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[11] || (_cache[11] = _createTextVNode(" 播客管理 ", -1))
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
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => activeTab.value = $event)
          }, {
            default: _withCtx(() => [
              _createVNode(_component_v_window_item, { value: "libraries" }, {
                default: _withCtx(() => [
                  _createVNode(_sfc_main$3, { api: __props.api }, null, 8, ["api"])
                ]),
                _: 1
              }),
              _createVNode(_component_v_window_item, { value: "authors" }, {
                default: _withCtx(() => [
                  _createVNode(_sfc_main$2, { api: __props.api }, null, 8, ["api"])
                ]),
                _: 1
              }),
              _createVNode(_component_v_window_item, { value: "podcasts" }, {
                default: _withCtx(() => [
                  _createVNode(_sfc_main$1, { api: __props.api }, null, 8, ["api"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["modelValue"])
        ]),
        _: 1
      });
    };
  }
});

const Page = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-483126cb"]]);

export { Page as default };
