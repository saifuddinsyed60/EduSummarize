#!python
import os
import sys
import subprocess
import venv
import platform
from pathlib import Path

def check_python_version():
    """Check if Python version is 3.8 or higher."""
    if sys.version_info < (3, 8):
        print("Error: Python 3.8 or higher is required")
        sys.exit(1)
    print("[OK] Python version check passed")

def check_ffmpeg():
    """Check if FFmpeg is installed."""
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        print("[OK] FFmpeg is installed")
    except (subprocess.SubprocessError, FileNotFoundError):
        print("Error: FFmpeg is not installed or not in PATH")
        print("Please install FFmpeg from https://ffmpeg.org/download.html")
        sys.exit(1)

def create_venv():
    """Create and activate virtual environment."""
    venv_path = Path("venv")
    if not venv_path.exists():
        print("Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
    print("[OK] Virtual environment ready")

def install_dependencies():
    """Install required packages."""
    print("Installing dependencies...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
    print("[OK] Dependencies installed")

def check_env_file():
    """Check if .env file exists."""
    if not Path(".env").exists():
        print("Warning: .env file not found")
        print("Please create a .env file with your GEMINI_API_KEY")
        print("Example: GEMINI_API_KEY=your_api_key_here")
    else:
        print("[OK] .env file found")

def run_tests():
    """Run the test suite."""
    print("\nRunning tests...")
    try:
        # Add the backend directory to Python path
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        os.environ["PYTHONPATH"] = backend_dir
        
        # Run tests with coverage
        result = subprocess.run(
            [sys.executable, "-m", "pytest", "test/", "-v", "--cov=app"],
            check=True
        )
        print("[OK] Tests completed successfully")
    except subprocess.CalledProcessError:
        print("Error: Some tests failed")
        sys.exit(1)

def main():
    """Main build process."""
    print("Starting build process...")
    
    # Run all steps
    check_python_version()
    check_ffmpeg()
    create_venv()
    install_dependencies()
    check_env_file()
    run_tests()
    
    print("\nBuild completed successfully!")
    print("\nTo start the server:")
    print("1. Activate the virtual environment:")
    print("   - Windows: .\\venv\\Scripts\\activate")
    print("   - Unix/MacOS: source venv/bin/activate")
    print("2. Run the server: uvicorn app.main:app --reload")

if __name__ == "__main__":
    main() 