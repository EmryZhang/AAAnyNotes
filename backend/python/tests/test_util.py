import os
from dotenv import load_dotenv

def get_project_root() -> str:
    current_file = os.path.abspath(__file__)
    while True:
        parent_dir = os.path.dirname(current_file)
        if os.path.exists(os.path.join(parent_dir, "config")):
            return parent_dir
        if parent_dir == os.path.dirname(parent_dir):
            raise FileNotFoundError("项目根目录未找到（未发现config文件夹）")
        current_file = parent_dir

PROJECT_ROOT = get_project_root()

def load_env():
    env_path = os.path.join(PROJECT_ROOT, "config", ".env")
    load_dotenv(dotenv_path=env_path)
    print(f"Python: 加载.env文件路径: {env_path}")
