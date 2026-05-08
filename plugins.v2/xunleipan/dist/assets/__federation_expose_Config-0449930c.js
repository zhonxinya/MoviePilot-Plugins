import { i as importShared, u as useToast } from './vendor-fec5d75f.js';
import { _ as _export_sfc } from './_plugin-vue_export-helper-c4c0bc37.js';

const {defineComponent:_defineComponent} = await importShared('vue');

const {createTextVNode:_createTextVNode,resolveComponent:_resolveComponent,withCtx:_withCtx,createVNode:_createVNode,openBlock:_openBlock,createBlock:_createBlock} = await importShared('vue');

const {ref,onMounted} = await importShared('vue');
const pluginId = "XunleiPan";
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "Config",
  props: {
    model: {
      type: Object,
      default: () => ({})
    },
    api: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["update:model", "action", "switch", "close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    console.log("[XunleiPan Config] ========== 组件加载 ==========");
    console.log("[XunleiPan Config] Props:", props);
    const toast = useToast();
    const config = ref({
      enabled: false,
      username: "",
      password: "",
      timeout: 10,
      max_retries: 3,
      auto_refresh: false
    });
    const passwordChanged = ref(false);
    const saving = ref(false);
    const testing = ref(false);
    const apiCall = async (endpoint, method = "GET", data) => {
      try {
        let response;
        if (method === "GET") {
          response = await props.api.get(`plugin/${pluginId}${endpoint}`);
        } else if (method === "POST") {
          response = await props.api.post(`plugin/${pluginId}${endpoint}`, data);
        }
        return response;
      } catch (error) {
        toast.error(`API 调用失败: ${error.message}`);
        throw error;
      }
    };
    const loadConfig = async () => {
      try {
        if (props.model && Object.keys(props.model).length > 0) {
          config.value = { ...config.value, ...props.model };
          console.log("[Config] 从 props.model 加载配置");
          if (config.value.password && config.value.password.startsWith("$2b$")) {
            config.value.password = "********";
            console.log("[Config] 密码已加密存储");
          }
        } else {
          try {
            const result = await apiCall("/config");
            if (result.code === 200 && result.data) {
              config.value = {
                ...config.value,
                ...result.data
              };
              console.log("[Config] 从 API 加载配置");
              if (config.value.password && config.value.password.startsWith("$2b$")) {
                config.value.password = "********";
                console.log("[Config] 密码已加密存储");
              }
            }
          } catch (apiError) {
            console.warn("[Config] API 获取配置失败，使用默认值:", apiError);
          }
        }
      } catch (error) {
        console.error("加载配置失败:", error);
      }
    };
    const saveConfig = async () => {
      if (!config.value.username || !config.value.password) {
        toast.error("请填写完整的账号信息");
        return;
      }
      saving.value = true;
      try {
        const configToSave = {
          enabled: config.value.enabled,
          username: config.value.username,
          timeout: config.value.timeout,
          max_retries: config.value.max_retries,
          auto_refresh: config.value.auto_refresh
        };
        if (passwordChanged.value && config.value.password !== "********") {
          configToSave.password = config.value.password;
          console.log("[Config] 密码已修改，将更新密码");
        } else if (config.value.password !== "********") {
          configToSave.password = config.value.password;
          console.log("[Config] 设置新密码");
        } else {
          console.log("[Config] 密码未修改，保持原密码");
        }
        const result = await apiCall("/config", "POST", configToSave);
        if (result.code === 200) {
          toast.success("✅ 配置保存成功");
          console.log("[Config] 配置保存成功");
          emit("update:model", config.value);
          passwordChanged.value = false;
        } else {
          toast.error(result.message || "❌ 保存失败");
          console.error("[Config] 保存失败:", result.message);
        }
      } catch (error) {
        console.error("[Config] 保存配置异常:", error);
        toast.error(error.message || "❌ 保存失败，请检查网络连接");
      } finally {
        saving.value = false;
      }
    };
    const testConnection = async () => {
      if (!config.value.username || !config.value.password) {
        toast.error("请先填写账号信息");
        return;
      }
      testing.value = true;
      try {
        const result = await apiCall("/test_connection", "POST", {
          username: config.value.username,
          password: config.value.password
        });
        if (result.code === 200) {
          toast.success("连接测试成功!");
        } else {
          toast.error(`连接失败: ${result.message}`);
        }
      } catch (error) {
        console.error("连接测试失败:", error);
      } finally {
        testing.value = false;
      }
    };
    onMounted(() => {
      loadConfig();
    });
    return (_ctx, _cache) => {
      const _component_v_icon = _resolveComponent("v-icon");
      const _component_v_card_title = _resolveComponent("v-card-title");
      const _component_v_text_field = _resolveComponent("v-text-field");
      const _component_v_col = _resolveComponent("v-col");
      const _component_v_row = _resolveComponent("v-row");
      const _component_v_alert = _resolveComponent("v-alert");
      const _component_v_card_text = _resolveComponent("v-card-text");
      const _component_v_card = _resolveComponent("v-card");
      const _component_v_switch = _resolveComponent("v-switch");
      const _component_v_list_item_title = _resolveComponent("v-list-item-title");
      const _component_v_list_item_subtitle = _resolveComponent("v-list-item-subtitle");
      const _component_v_list_item = _resolveComponent("v-list-item");
      const _component_v_list = _resolveComponent("v-list");
      const _component_v_spacer = _resolveComponent("v-spacer");
      const _component_v_btn = _resolveComponent("v-btn");
      const _component_v_card_actions = _resolveComponent("v-card-actions");
      const _component_v_form = _resolveComponent("v-form");
      const _component_v_container = _resolveComponent("v-container");
      return _openBlock(), _createBlock(_component_v_container, { fluid: "" }, {
        default: _withCtx(() => [
          _createVNode(_component_v_form, { ref: "configForm" }, {
            default: _withCtx(() => [
              _createVNode(_component_v_card, { class: "mb-4" }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_card_title, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_icon, {
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: _withCtx(() => [..._cache[6] || (_cache[6] = [
                          _createTextVNode("mdi-account-key", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[7] || (_cache[7] = _createTextVNode(" 迅雷账号配置 ", -1))
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_card_text, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_row, null, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_col, {
                            cols: "12",
                            md: "6"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_text_field, {
                                modelValue: config.value.username,
                                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => config.value.username = $event),
                                label: "用户名/手机号",
                                placeholder: "请输入迅雷账号",
                                "prepend-icon": "mdi-account",
                                rules: [(v) => !!v || "请输入用户名"],
                                required: ""
                              }, null, 8, ["modelValue", "rules"])
                            ]),
                            _: 1
                          }),
                          _createVNode(_component_v_col, {
                            cols: "12",
                            md: "6"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_text_field, {
                                modelValue: config.value.password,
                                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => config.value.password = $event),
                                label: "密码",
                                type: "password",
                                placeholder: "请输入密码",
                                "prepend-icon": "mdi-lock",
                                rules: [(v) => !!v || "请输入密码"],
                                required: "",
                                onInput: _cache[2] || (_cache[2] = ($event) => passwordChanged.value = true)
                              }, null, 8, ["modelValue", "rules"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      _createVNode(_component_v_alert, {
                        type: "info",
                        variant: "tonal",
                        class: "mt-3"
                      }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_icon, { class: "mr-2" }, {
                            default: _withCtx(() => [..._cache[8] || (_cache[8] = [
                              _createTextVNode("mdi-information", -1)
                            ])]),
                            _: 1
                          }),
                          _cache[9] || (_cache[9] = _createTextVNode(" 请确保输入的账号信息正确,插件将使用此账号登录迅雷网盘 ", -1))
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              _createVNode(_component_v_card, { class: "mb-4" }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_card_title, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_icon, {
                        color: "secondary",
                        class: "mr-2"
                      }, {
                        default: _withCtx(() => [..._cache[10] || (_cache[10] = [
                          _createTextVNode("mdi-cog", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[11] || (_cache[11] = _createTextVNode(" 高级设置 ", -1))
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_card_text, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_row, null, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_col, {
                            cols: "12",
                            md: "6"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_text_field, {
                                modelValue: config.value.timeout,
                                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => config.value.timeout = $event),
                                modelModifiers: { number: true },
                                label: "请求超时时间(秒)",
                                type: "number",
                                min: "5",
                                max: "120",
                                "prepend-icon": "mdi-timer",
                                hint: "API 请求超时时间,建议 10-30 秒"
                              }, null, 8, ["modelValue"])
                            ]),
                            _: 1
                          }),
                          _createVNode(_component_v_col, {
                            cols: "12",
                            md: "6"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_text_field, {
                                modelValue: config.value.max_retries,
                                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => config.value.max_retries = $event),
                                modelModifiers: { number: true },
                                label: "最大重试次数",
                                type: "number",
                                min: "1",
                                max: "10",
                                "prepend-icon": "mdi-restart",
                                hint: "失败时的最大重试次数"
                              }, null, 8, ["modelValue"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      _createVNode(_component_v_row, null, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_col, { cols: "12" }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_switch, {
                                modelValue: config.value.auto_refresh,
                                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => config.value.auto_refresh = $event),
                                label: "自动刷新任务状态",
                                "prepend-icon": "mdi-autorenew",
                                hint: "开启后将每 30 秒自动刷新离线下载任务状态"
                              }, null, 8, ["modelValue"])
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
              _createVNode(_component_v_card, null, {
                default: _withCtx(() => [
                  _createVNode(_component_v_card_title, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_icon, {
                        color: "success",
                        class: "mr-2"
                      }, {
                        default: _withCtx(() => [..._cache[12] || (_cache[12] = [
                          _createTextVNode("mdi-help-circle", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[13] || (_cache[13] = _createTextVNode(" 功能说明 ", -1))
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_card_text, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_list, { density: "compact" }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_list_item, null, {
                            prepend: _withCtx(() => [
                              _createVNode(_component_v_icon, { color: "primary" }, {
                                default: _withCtx(() => [..._cache[14] || (_cache[14] = [
                                  _createTextVNode("mdi-folder-outline", -1)
                                ])]),
                                _: 1
                              })
                            ]),
                            default: _withCtx(() => [
                              _createVNode(_component_v_list_item_title, null, {
                                default: _withCtx(() => [..._cache[15] || (_cache[15] = [
                                  _createTextVNode("文件浏览", -1)
                                ])]),
                                _: 1
                              }),
                              _createVNode(_component_v_list_item_subtitle, null, {
                                default: _withCtx(() => [..._cache[16] || (_cache[16] = [
                                  _createTextVNode(" 支持浏览迅雷网盘中的文件和文件夹,查看文件大小、修改时间等信息 ", -1)
                                ])]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          _createVNode(_component_v_list_item, null, {
                            prepend: _withCtx(() => [
                              _createVNode(_component_v_icon, { color: "primary" }, {
                                default: _withCtx(() => [..._cache[17] || (_cache[17] = [
                                  _createTextVNode("mdi-cloud-download-outline", -1)
                                ])]),
                                _: 1
                              })
                            ]),
                            default: _withCtx(() => [
                              _createVNode(_component_v_list_item_title, null, {
                                default: _withCtx(() => [..._cache[18] || (_cache[18] = [
                                  _createTextVNode("离线下载", -1)
                                ])]),
                                _: 1
                              }),
                              _createVNode(_component_v_list_item_subtitle, null, {
                                default: _withCtx(() => [..._cache[19] || (_cache[19] = [
                                  _createTextVNode(" 支持添加 HTTP、HTTPS、FTP、磁力链接等离线下载任务到迅雷网盘 ", -1)
                                ])]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          _createVNode(_component_v_list_item, null, {
                            prepend: _withCtx(() => [
                              _createVNode(_component_v_icon, { color: "primary" }, {
                                default: _withCtx(() => [..._cache[20] || (_cache[20] = [
                                  _createTextVNode("mdi-format-list-bulleted", -1)
                                ])]),
                                _: 1
                              })
                            ]),
                            default: _withCtx(() => [
                              _createVNode(_component_v_list_item_title, null, {
                                default: _withCtx(() => [..._cache[21] || (_cache[21] = [
                                  _createTextVNode("任务管理", -1)
                                ])]),
                                _: 1
                              }),
                              _createVNode(_component_v_list_item_subtitle, null, {
                                default: _withCtx(() => [..._cache[22] || (_cache[22] = [
                                  _createTextVNode(" 查看离线下载任务列表,支持暂停、恢复、取消等操作 ", -1)
                                ])]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          _createVNode(_component_v_list_item, null, {
                            prepend: _withCtx(() => [
                              _createVNode(_component_v_icon, { color: "primary" }, {
                                default: _withCtx(() => [..._cache[23] || (_cache[23] = [
                                  _createTextVNode("mdi-download", -1)
                                ])]),
                                _: 1
                              })
                            ]),
                            default: _withCtx(() => [
                              _createVNode(_component_v_list_item_title, null, {
                                default: _withCtx(() => [..._cache[24] || (_cache[24] = [
                                  _createTextVNode("文件下载", -1)
                                ])]),
                                _: 1
                              }),
                              _createVNode(_component_v_list_item_subtitle, null, {
                                default: _withCtx(() => [..._cache[25] || (_cache[25] = [
                                  _createTextVNode(" 从迅雷网盘下载文件到本地(需要配置下载器) ", -1)
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
              _createVNode(_component_v_card_actions, { class: "mt-4" }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_spacer),
                  _createVNode(_component_v_btn, {
                    color: "primary",
                    size: "large",
                    onClick: saveConfig,
                    loading: saving.value,
                    "prepend-icon": "mdi-content-save"
                  }, {
                    default: _withCtx(() => [..._cache[26] || (_cache[26] = [
                      _createTextVNode(" 保存配置 ", -1)
                    ])]),
                    _: 1
                  }, 8, ["loading"]),
                  _createVNode(_component_v_btn, {
                    color: "secondary",
                    size: "large",
                    onClick: testConnection,
                    loading: testing.value,
                    "prepend-icon": "mdi-connection",
                    class: "ml-2"
                  }, {
                    default: _withCtx(() => [..._cache[27] || (_cache[27] = [
                      _createTextVNode(" 测试连接 ", -1)
                    ])]),
                    _: 1
                  }, 8, ["loading"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 512)
        ]),
        _: 1
      });
    };
  }
});

const Config_vue_vue_type_style_index_0_scoped_61fed0c4_lang = '';

const Config = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-61fed0c4"]]);

export { Config as default };
