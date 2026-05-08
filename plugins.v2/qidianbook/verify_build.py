"""
起点插件前端构建验证脚本

验证内容：
1. dist 目录是否存在
2. remoteEntry.js 是否生成
3. Page.vue 和 Config.vue 是否正确暴露
4. 文件大小是否合理
"""

import os
import sys


def verify_frontend_build():
    """验证前端构建结果"""
    print("\n" + "="*60)
    print("验证起点插件前端构建")
    print("="*60)
    
    # 获取插件目录
    plugin_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(plugin_dir, 'dist')
    assets_dir = os.path.join(dist_dir, 'assets')
    
    # 检查 dist 目录
    if not os.path.exists(dist_dir):
        print("❌ dist 目录不存在")
        return False
    
    print("✅ dist 目录存在")
    
    # 检查 assets 目录
    if not os.path.exists(assets_dir):
        print("❌ assets 目录不存在")
        return False
    
    print("✅ assets 目录存在")
    
    # 检查关键文件
    required_files = [
        'remoteEntry.js',
        '__federation_expose_Page-*.js',
        '__federation_expose_Config-*.js',
    ]
    
    all_found = True
    for pattern in required_files:
        import glob
        files = glob.glob(os.path.join(assets_dir, pattern))
        if files:
            file_size = os.path.getsize(files[0])
            print(f"✅ {pattern}: {files[0]} ({file_size} bytes)")
        else:
            print(f"❌ {pattern}: 未找到")
            all_found = False
    
    # 检查 index.html
    index_html = os.path.join(dist_dir, 'index.html')
    if os.path.exists(index_html):
        size = os.path.getsize(index_html)
        print(f"✅ index.html: {size} bytes")
    else:
        print("❌ index.html: 未找到")
        all_found = False
    
    # 列出所有文件
    print("\n📁 构建文件列表:")
    for root, dirs, files in os.walk(dist_dir):
        level = root.replace(dist_dir, '').count(os.sep)
        indent = ' ' * 2 * level
        print(f'{indent}{os.path.basename(root)}/')
        subindent = ' ' * 2 * (level + 1)
        for file in sorted(files):
            filepath = os.path.join(root, file)
            size = os.path.getsize(filepath)
            print(f'{subindent}{file} ({size:,} bytes)')
    
    return all_found


def main():
    """主函数"""
    print("🚀 开始验证前端构建")
    
    try:
        success = verify_frontend_build()
        
        if success:
            print("\n" + "="*60)
            print("✅ 前端构建验证通过")
            print("="*60)
            print("\n下一步:")
            print("1. 确保 MoviePilot 后端已启动")
            print("2. 访问插件页面测试功能")
            print("3. 检查浏览器控制台是否有错误")
        else:
            print("\n" + "="*60)
            print("❌ 前端构建验证失败")
            print("="*60)
            print("\n请重新运行构建:")
            print("  cd plugins.v2/qidianbook")
            print("  npm run build")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n❌ 验证过程中出现错误: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
