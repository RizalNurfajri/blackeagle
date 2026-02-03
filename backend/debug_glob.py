
import glob
import os

results_dir = r"d:\Coding Learning\blackeagle\backend\blackbird\results"
value = "rizalnurfajri555"
pattern = os.path.join(results_dir, f"*{value}*_blackbird", "*.json")
print(f"Pattern: {pattern}")
files = glob.glob(pattern)
print(f"Files: {files}")
