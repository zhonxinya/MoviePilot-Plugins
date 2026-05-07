import { importShared } from './__federation_fn_import-e338e0b1.js';
import { _ as _export_sfc, C as CONFIG_DEFAULTS } from './constants-b97608de.js';

const Config_vue_vue_type_style_index_0_scoped_0037bdd1_lang = '';

const {createTextVNode:_createTextVNode,resolveComponent:_resolveComponent,withCtx:_withCtx,createVNode:_createVNode,toDisplayString:_toDisplayString,openBlock:_openBlock,createBlock:_createBlock,createCommentVNode:_createCommentVNode,withModifiers:_withModifiers} = await importShared('vue');


const {ref,onMounted} = await importShared('vue');


const _sfc_main = {
  __name: 'Config',
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
  emits: ['update:model'],
  setup(__props, { emit: __emit }) {

const props = __props;

const emit = __emit;

// 配置项
const config = ref({
  enabled: false,
  api_url: CONFIG_DEFAULTS.API_URL,
  default_format: CONFIG_DEFAULTS.DEFAULT_FORMAT
});

// 加载状态
const isLoading = ref(false);
const isSaving = ref(false);
const saveMessage = ref('');
const saveMessageType = ref(''); // 'success' or 'error'

// 加载配置
async function loadConfig() {
  isLoading.value = true;
  try {
    // 优先从 props.model 加载
    if (props.model && Object.keys(props.model).length > 0) {
      config.value = { ...config.value, ...props.model };
      console.log('[Config] 从 props 加载配置:', config.value);
    } else {
      // 尝试从 API 获取最新配置
      try {
        const response = await props.api.get('plugin/Sonovel/config');
        if (response.code === 200 && response.data) {
          config.value = {
            enabled: response.data.enabled || false,
            api_url: response.data.api_url || CONFIG_DEFAULTS.API_URL,
            default_format: response.data.default_format || CONFIG_DEFAULTS.DEFAULT_FORMAT
          };
          console.log('[Config] 从 API 加载配置:', config.value);
        }
      } catch (apiError) {
        console.warn('[Config] API 获取配置失败，使用默认值:', apiError);
      }
    }
  } catch (err) {
    console.error('[Config] 加载配置失败:', err);
  } finally {
    isLoading.value = false;
  }
}

// 保存配置
async function saveConfig() {
  isSaving.value = true;
  saveMessage.value = '';
  
  try {
    // 验证 API URL 格式
    if (!config.value.api_url) {
      showSaveMessage('error', 'API 地址不能为空');
      isSaving.value = false;
      return
    }
    
    if (!isValidUrl(config.value.api_url)) {
      showSaveMessage('error', 'API 地址格式不正确');
      isSaving.value = false;
      return
    }
    
    // 通过 API 保存配置
    const response = await props.api.post('plugin/Sonovel/config', config.value);
    
    if (response.code === 200) {
      showSaveMessage('success', '配置保存成功');
      // 通知父组件配置已更新
      emit('update:model', config.value);
    } else {
      showSaveMessage('error', response.message || '保存失败');
    }
  } catch (error) {
    console.error('[Config] 保存配置失败:', error);
    showSaveMessage('error', error.message || '保存失败');
  } finally {
    isSaving.value = false;
  }
}

// 显示保存消息
function showSaveMessage(type, message) {
  saveMessageType.value = type;
  saveMessage.value = message;
  
  // 3秒后自动清除消息
  setTimeout(() => {
    saveMessage.value = '';
  }, 3000);
}

// 验证 URL 格式
function isValidUrl(url) {
  try {
    new URL(url);
    return true
  } catch {
    return false
  }
}

onMounted(() => {
  loadConfig();
});

return (_ctx, _cache) => {
  const _component_v_icon = _resolveComponent("v-icon");
  const _component_v_card_title = _resolveComponent("v-card-title");
  const _component_v_divider = _resolveComponent("v-divider");
  const _component_v_alert = _resolveComponent("v-alert");
  const _component_v_switch = _resolveComponent("v-switch");
  const _component_v_text_field = _resolveComponent("v-text-field");
  const _component_v_select = _resolveComponent("v-select");
  const _component_v_form = _resolveComponent("v-form");
  const _component_v_card_text = _resolveComponent("v-card-text");
  const _component_v_spacer = _resolveComponent("v-spacer");
  const _component_v_btn = _resolveComponent("v-btn");
  const _component_v_card_actions = _resolveComponent("v-card-actions");
  const _component_v_card = _resolveComponent("v-card");
  const _component_v_container = _resolveComponent("v-container");

  return (_openBlock(), _createBlock(_component_v_container, {
    fluid: "",
    class: "pa-6"
  }, {
    default: _withCtx(() => [
      _createVNode(_component_v_card, {
        elevation: "2",
        loading: isLoading.value
      }, {
        default: _withCtx(() => [
          _createVNode(_component_v_card_title, { class: "text-h5 font-weight-bold" }, {
            default: _withCtx(() => [
              _createVNode(_component_v_icon, {
                start: "",
                color: "primary"
              }, {
                default: _withCtx(() => [...(_cache[4] || (_cache[4] = [
                  _createTextVNode("mdi-cog-outline", -1)
                ]))]),
                _: 1
              }),
              _cache[5] || (_cache[5] = _createTextVNode(" SoNovel 插件配置 ", -1))
            ]),
            _: 1
          }),
          _createVNode(_component_v_divider),
          _createVNode(_component_v_card_text, null, {
            default: _withCtx(() => [
              (saveMessage.value)
                ? (_openBlock(), _createBlock(_component_v_alert, {
                    key: 0,
                    type: saveMessageType.value,
                    variant: "tonal",
                    density: "compact",
                    closable: "",
                    class: "mb-4",
                    "onClick:close": _cache[0] || (_cache[0] = $event => (saveMessage.value = ''))
                  }, {
                    default: _withCtx(() => [
                      _createTextVNode(_toDisplayString(saveMessage.value), 1)
                    ]),
                    _: 1
                  }, 8, ["type"]))
                : _createCommentVNode("", true),
              _createVNode(_component_v_form, {
                onSubmit: _withModifiers(saveConfig, ["prevent"])
              }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_switch, {
                    modelValue: config.value.enabled,
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((config.value.enabled) = $event)),
                    label: "启用插件",
                    color: "primary",
                    inset: "",
                    class: "mb-4"
                  }, null, 8, ["modelValue"]),
                  _createVNode(_component_v_text_field, {
                    modelValue: config.value.api_url,
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => ((config.value.api_url) = $event)),
                    label: "API 地址",
                    placeholder: "SoNovel API 服务器地址",
                    "prepend-inner-icon": "mdi-server",
                    variant: "outlined",
                    class: "mb-4",
                    rules: [v => !!v || 'API 地址不能为空', v => isValidUrl(v) || 'URL 格式不正确']
                  }, null, 8, ["modelValue", "rules"]),
                  _createVNode(_component_v_select, {
                    modelValue: config.value.default_format,
                    "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => ((config.value.default_format) = $event)),
                    items: [
              { title: 'EPUB', value: 'epub' },
              { title: 'PDF', value: 'pdf' },
              { title: 'MOBI', value: 'mobi' },
              { title: 'TXT', value: 'txt' }
            ],
                    label: "默认格式",
                    "prepend-inner-icon": "mdi-file-document",
                    variant: "outlined",
                    class: "mb-4"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }),
          _createVNode(_component_v_divider),
          _createVNode(_component_v_card_actions, null, {
            default: _withCtx(() => [
              _createVNode(_component_v_spacer),
              _createVNode(_component_v_btn, {
                color: "primary",
                variant: "flat",
                "prepend-icon": "mdi-content-save",
                loading: isSaving.value,
                disabled: isSaving.value,
                onClick: saveConfig
              }, {
                default: _withCtx(() => [
                  _createTextVNode(_toDisplayString(isSaving.value ? '保存中...' : '保存配置'), 1)
                ]),
                _: 1
              }, 8, ["loading", "disabled"])
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["loading"])
    ]),
    _: 1
  }))
}
}

};
const Config = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-0037bdd1"]]);

export { Config as default };
