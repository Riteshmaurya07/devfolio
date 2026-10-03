import re

with open('frontend/src/app/resumes/builder/page.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'delete (updated as any).contact;' in line:
        continue
    if 'delete (updated as any).skills;' in line:
        continue
    if 'const updated =' in line and '{ ...activeResume.content }' in line:
        line = line.replace('const updated = { ...activeResume.content };', 'const updated: any = { ...activeResume.content };\n      delete updated.contact;\n      delete updated.skills;')
    new_lines.append(line)

with open('frontend/src/app/resumes/builder/page.tsx', 'w') as f:
    f.writelines(new_lines)
