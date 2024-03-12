import sys
import subprocess


def setup():
    # Python packages
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

    # NPM packages
    subprocess.run(["npm", "install"], shell=True)

    # JS package
    subprocess.run(["npm", "run", "build"], shell=True)


if __name__ == "__main__":
    setup()
