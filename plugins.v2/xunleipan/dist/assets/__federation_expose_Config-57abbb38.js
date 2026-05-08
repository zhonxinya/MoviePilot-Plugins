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
      cookie: "",
      user_agent: "",
      timeout: 10,
      max_retries: 3,
      auto_refresh: false
    });
    const cookieChanged = ref(false);
    const saving = ref(false);
    const testing = ref(false);
    const guideLoading = ref(false);
    const browserLoginLoading = ref(false);
    const rules = {
      timeout: [
        (v) => !!v || "请输入超时时间",
        (v) => v >= 5 && v <= 120 || "超时时间应在5-120秒之间"
      ],
      max_retries: [
        (v) => !!v || "请输入重试次数",
        (v) => v >= 1 && v <= 10 || "重试次数应在1-10次之间"
      ]
    };
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
          if (!config.value.cookie && config.value.password && config.value.password !== "********") {
            config.value.cookie = config.value.password;
            console.log("[Config] 已从旧 password 字段迁移 Cookie");
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
              if (!config.value.cookie && config.value.password && config.value.password !== "********") {
                config.value.cookie = config.value.password;
                console.log("[Config] 已从 API 旧 password 字段迁移 Cookie");
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
      if (config.value.enabled && (!config.value.cookie || config.value.cookie === "********")) {
        toast.error("启用插件时必须导入浏览器 Cookie 会话");
        return;
      }
      const form = document.querySelector("form");
      if (form && !form.checkValidity()) {
        toast.error("请检查输入格式");
        return;
      }
      saving.value = true;
      try {
        const configToSave = {
          enabled: config.value.enabled,
          username: config.value.username.trim(),
          user_agent: config.value.user_agent.trim(),
          timeout: parseInt(config.value.timeout) || 10,
          max_retries: parseInt(config.value.max_retries) || 3,
          auto_refresh: config.value.auto_refresh
        };
        if (cookieChanged.value) {
          configToSave.cookie = config.value.cookie === "********" ? "" : config.value.cookie;
          console.log("[Config] Cookie 已修改，将更新会话");
        } else if (config.value.cookie && config.value.cookie !== "********") {
          configToSave.cookie = config.value.cookie;
        }
        const result = await apiCall("/config", "POST", configToSave);
        if (result.code === 200) {
          toast.success("✅ 配置保存成功");
          console.log("[Config] 配置保存成功");
          emit("update:model", config.value);
          cookieChanged.value = false;
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
      const cookieValue = config.value.cookie === "********" ? "" : config.value.cookie;
      if (!cookieValue) {
        toast.error("请先粘贴浏览器 Cookie 会话");
        return;
      }
      testing.value = true;
      try {
        const result = await apiCall("/test_connection", "POST", {
          username: config.value.username,
          cookie: cookieValue,
          user_agent: config.value.user_agent
        });
        if (result.code === 200) {
          toast.success("✅ Cookie 会话测试成功!");
        } else {
          toast.error(`❌ 连接失败: ${result.message}`);
        }
      } catch (error) {
        console.error("连接测试失败:", error);
        toast.error(`❌ 连接测试失败: ${error.message}`);
      } finally {
        testing.value = false;
      }
    };
    const openLoginGuide = async () => {
      guideLoading.value = true;
      const loginWindow = window.open("", "_blank", "noopener,noreferrer");
      try {
        const result = await apiCall("/login_guide");
        if (result.code === 200 && result.data?.login_url) {
          if (loginWindow) {
            loginWindow.location.href = result.data.login_url;
          } else {
            window.location.href = result.data.login_url;
          }
          toast.info(result.data.note || "已打开迅雷登录页，请在新页面完成登录后再采集会话");
        } else {
          if (loginWindow) {
            loginWindow.close();
          }
          toast.error(result.message || "无法获取登录页地址");
        }
      } catch (error) {
        console.error("打开登录页失败:", error);
        if (loginWindow) {
          loginWindow.close();
        }
        toast.error(error.message || "打开登录页失败");
      } finally {
        guideLoading.value = false;
      }
    };
    const browserLogin = async () => {
      browserLoginLoading.value = true;
      try {
        const result = await apiCall("/browser_login", "POST", {
          wait_seconds: 180,
          login_url: "https://pan.xunlei.com"
        });
        if (result.code === 200 && result.data) {
          config.value.cookie = result.data.cookie || "";
          config.value.user_agent = result.data.user_agent || "";
          cookieChanged.value = true;
          emit("update:model", config.value);
          const accountText = result.data.account ? `，账号标识: ${result.data.account}` : "";
          toast.success(`✅ 浏览器会话采集成功${accountText}，请保存配置`);
        } else {
          const retryHint = result.data?.login_url ? `，可先打开 ${result.data.login_url} 手动登录` : "";
          toast.error(`❌ 浏览器登录失败: ${result.message || "未知错误"}${retryHint}`);
        }
      } catch (error) {
        console.error("浏览器登录失败:", error);
        toast.error(error.message || "浏览器登录失败");
      } finally {
        browserLoginLoading.value = false;
      }
    };
    onMounted(() => {
      loadConfig();
    });
    return (_ctx, _cache) => {
      const _component_v_icon = _resolveComponent("v-icon");
      const _component_v_card_title = _resolveComponent("v-card-title");
      const _component_v_switch = _resolveComponent("v-switch");
      const _component_v_col = _resolveComponent("v-col");
      const _component_v_row = _resolveComponent("v-row");
      const _component_v_alert = _resolveComponent("v-alert");
      const _component_v_card_text = _resolveComponent("v-card-text");
      const _component_v_card = _resolveComponent("v-card");
      const _component_v_text_field = _resolveComponent("v-text-field");
      const _component_v_btn = _resolveComponent("v-btn");
      const _component_v_textarea = _resolveComponent("v-textarea");
      const _component_v_list_item_title = _resolveComponent("v-list-item-title");
      const _component_v_list_item_subtitle = _resolveComponent("v-list-item-subtitle");
      const _component_v_list_item = _resolveComponent("v-list-item");
      const _component_v_list = _resolveComponent("v-list");
      const _component_v_spacer = _resolveComponent("v-spacer");
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
                        color: "success",
                        class: "mr-2"
                      }, {
                        default: _withCtx(() => [..._cache[8] || (_cache[8] = [
                          _createTextVNode("mdi-power", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[9] || (_cache[9] = _createTextVNode(" 插件状态 ", -1))
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_card_text, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_row, null, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_col, { cols: "12" }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_switch, {
                                modelValue: config.value.enabled,
                                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => config.value.enabled = $event),
                                label: "启用插件",
                                "prepend-icon": "mdi-check-circle",
                                hint: "开启后插件将自动运行",
                                "persistent-hint": ""
                              }, null, 8, ["modelValue"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      config.value.enabled ? (_openBlock(), _createBlock(_component_v_alert, {
                        key: 0,
                        type: "success",
                        variant: "tonal",
                        class: "mt-3"
                      }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_icon, { class: "mr-2" }, {
                            default: _withCtx(() => [..._cache[10] || (_cache[10] = [
                              _createTextVNode("mdi-check-circle", -1)
                            ])]),
                            _: 1
                          }),
                          _cache[11] || (_cache[11] = _createTextVNode(" 插件已启用，可以正常使用所有功能 ", -1))
                        ]),
                        _: 1
                      })) : (_openBlock(), _createBlock(_component_v_alert, {
                        key: 1,
                        type: "warning",
                        variant: "tonal",
                        class: "mt-3"
                      }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_icon, { class: "mr-2" }, {
                            default: _withCtx(() => [..._cache[12] || (_cache[12] = [
                              _createTextVNode("mdi-alert-circle", -1)
                            ])]),
                            _: 1
                          }),
                          _cache[13] || (_cache[13] = _createTextVNode(" 插件已禁用，需要启用后才能使用功能 ", -1))
                        ]),
                        _: 1
                      }))
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
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: _withCtx(() => [..._cache[14] || (_cache[14] = [
                          _createTextVNode("mdi-account-key", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[15] || (_cache[15] = _createTextVNode(" 迅雷网盘会话配置 ", -1))
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
                                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => config.value.username = $event),
                                label: "账号备注 / 手机号",
                                placeholder: "可选，仅用于备注",
                                "prepend-icon": "mdi-account",
                                clearable: ""
                              }, null, 8, ["modelValue"])
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
                            default: _withCtx(() => [..._cache[16] || (_cache[16] = [
                              _createTextVNode("mdi-information", -1)
                            ])]),
                            _: 1
                          }),
                          _cache[17] || (_cache[17] = _createTextVNode(" 迅雷网页端当前公开页以手机验证登录 / 账号密码登录为主，没有稳定可见的二维码入口。请先打开登录页并在浏览器里完成登录，再由插件采集 Cookie 和 User-Agent；测试连接会直接校验该会话是否可访问网盘资源。 ", -1))
                        ]),
                        _: 1
                      }),
                      _createVNode(_component_v_row, { class: "mt-3" }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_col, {
                            cols: "12",
                            md: "6"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_btn, {
                                color: "primary",
                                block: "",
                                "prepend-icon": "mdi-open-in-new",
                                loading: guideLoading.value,
                                onClick: openLoginGuide
                              }, {
                                default: _withCtx(() => [..._cache[18] || (_cache[18] = [
                                  _createTextVNode(" 打开登录页 ", -1)
                                ])]),
                                _: 1
                              }, 8, ["loading"])
                            ]),
                            _: 1
                          }),
                          _createVNode(_component_v_col, {
                            cols: "12",
                            md: "6"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_btn, {
                                color: "secondary",
                                block: "",
                                "prepend-icon": "mdi-web",
                                loading: browserLoginLoading.value,
                                onClick: browserLogin
                              }, {
                                default: _withCtx(() => [..._cache[19] || (_cache[19] = [
                                  _createTextVNode(" 浏览器登录并采集 ", -1)
                                ])]),
                                _: 1
                              }, 8, ["loading"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      _createVNode(_component_v_textarea, {
                        modelValue: config.value.cookie,
                        "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => config.value.cookie = $event),
                        label: "浏览器 Cookie",
                        placeholder: "例如：SESSION=xxx; device=xxx; ...",
                        "prepend-icon": "mdi-cookie",
                        rows: "5",
                        "auto-grow": "",
                        clearable: "",
                        class: "mt-4",
                        onInput: _cache[3] || (_cache[3] = ($event) => cookieChanged.value = true),
                        hint: "粘贴浏览器登录后复制的完整 Cookie 字符串",
                        "persistent-hint": ""
                      }, null, 8, ["modelValue"]),
                      _createVNode(_component_v_textarea, {
                        modelValue: config.value.user_agent,
                        "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => config.value.user_agent = $event),
                        label: "浏览器 User-Agent",
                        placeholder: "登录后可自动采集，也可手动粘贴",
                        "prepend-icon": "mdi-card-text-outline",
                        rows: "2",
                        "auto-grow": "",
                        clearable: "",
                        class: "mt-4",
                        hint: "建议与浏览器登录时保持一致，便于会话校验",
                        "persistent-hint": ""
                      }, null, 8, ["modelValue"])
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
                        default: _withCtx(() => [..._cache[20] || (_cache[20] = [
                          _createTextVNode("mdi-cog", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[21] || (_cache[21] = _createTextVNode(" 高级设置 ", -1))
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
                                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => config.value.timeout = $event),
                                modelModifiers: { number: true },
                                label: "请求超时时间(秒)",
                                type: "number",
                                min: "5",
                                max: "120",
                                "prepend-icon": "mdi-timer",
                                rules: rules.timeout,
                                hint: "API 请求超时时间，建议 10-30 秒",
                                "persistent-hint": ""
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
                                modelValue: config.value.max_retries,
                                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => config.value.max_retries = $event),
                                modelModifiers: { number: true },
                                label: "最大重试次数",
                                type: "number",
                                min: "1",
                                max: "10",
                                "prepend-icon": "mdi-restart",
                                rules: rules.max_retries,
                                hint: "失败时的最大重试次数",
                                "persistent-hint": ""
                              }, null, 8, ["modelValue", "rules"])
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
                                "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => config.value.auto_refresh = $event),
                                label: "自动刷新任务状态",
                                "prepend-icon": "mdi-autorenew",
                                hint: "开启后将每 30 秒自动刷新离线下载任务状态",
                                "persistent-hint": ""
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
                        default: _withCtx(() => [..._cache[22] || (_cache[22] = [
                          _createTextVNode("mdi-help-circle", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[23] || (_cache[23] = _createTextVNode(" 功能说明 ", -1))
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
                                default: _withCtx(() => [..._cache[24] || (_cache[24] = [
                                  _createTextVNode("mdi-folder-outline", -1)
                                ])]),
                                _: 1
                              })
                            ]),
                            default: _withCtx(() => [
                              _createVNode(_component_v_list_item_title, null, {
                                default: _withCtx(() => [..._cache[25] || (_cache[25] = [
                                  _createTextVNode("文件浏览", -1)
                                ])]),
                                _: 1
                              }),
                              _createVNode(_component_v_list_item_subtitle, null, {
                                default: _withCtx(() => [..._cache[26] || (_cache[26] = [
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
                                default: _withCtx(() => [..._cache[27] || (_cache[27] = [
                                  _createTextVNode("mdi-cloud-download-outline", -1)
                                ])]),
                                _: 1
                              })
                            ]),
                            default: _withCtx(() => [
                              _createVNode(_component_v_list_item_title, null, {
                                default: _withCtx(() => [..._cache[28] || (_cache[28] = [
                                  _createTextVNode("离线下载", -1)
                                ])]),
                                _: 1
                              }),
                              _createVNode(_component_v_list_item_subtitle, null, {
                                default: _withCtx(() => [..._cache[29] || (_cache[29] = [
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
                                default: _withCtx(() => [..._cache[30] || (_cache[30] = [
                                  _createTextVNode("mdi-format-list-bulleted", -1)
                                ])]),
                                _: 1
                              })
                            ]),
                            default: _withCtx(() => [
                              _createVNode(_component_v_list_item_title, null, {
                                default: _withCtx(() => [..._cache[31] || (_cache[31] = [
                                  _createTextVNode("任务管理", -1)
                                ])]),
                                _: 1
                              }),
                              _createVNode(_component_v_list_item_subtitle, null, {
                                default: _withCtx(() => [..._cache[32] || (_cache[32] = [
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
                                default: _withCtx(() => [..._cache[33] || (_cache[33] = [
                                  _createTextVNode("mdi-download", -1)
                                ])]),
                                _: 1
                              })
                            ]),
                            default: _withCtx(() => [
                              _createVNode(_component_v_list_item_title, null, {
                                default: _withCtx(() => [..._cache[34] || (_cache[34] = [
                                  _createTextVNode("文件下载", -1)
                                ])]),
                                _: 1
                              }),
                              _createVNode(_component_v_list_item_subtitle, null, {
                                default: _withCtx(() => [..._cache[35] || (_cache[35] = [
                                  _createTextVNode(" 从迅雷网盘下载文件到本地(需要配置下载器) ", -1)
                                ])]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          _createVNode(_component_v_list_item, null, {
                            prepend: _withCtx(() => [
                              _createVNode(_component_v_icon, { color: "primary" }, {
                                default: _withCtx(() => [..._cache[36] || (_cache[36] = [
                                  _createTextVNode("mdi-cookie", -1)
                                ])]),
                                _: 1
                              })
                            ]),
                            default: _withCtx(() => [
                              _createVNode(_component_v_list_item_title, null, {
                                default: _withCtx(() => [..._cache[37] || (_cache[37] = [
                                  _createTextVNode("Cookie 会话登录", -1)
                                ])]),
                                _: 1
                              }),
                              _createVNode(_component_v_list_item_subtitle, null, {
                                default: _withCtx(() => [..._cache[38] || (_cache[38] = [
                                  _createTextVNode(" 在浏览器登录 pan.xunlei.com 后复制 Cookie 粘贴到配置中，插件会用该会话直接访问 api-pan.xunlei.com。 ", -1)
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
                    default: _withCtx(() => [..._cache[39] || (_cache[39] = [
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
                    default: _withCtx(() => [..._cache[40] || (_cache[40] = [
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

const Config_vue_vue_type_style_index_0_scoped_5580e035_lang = '';

const Config = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5580e035"]]);

export { Config as default };
