import os, shutil

# Empty the deployment directory
folder = 'C:/Users/Grant/AppData/Local/Screeps/scripts/127_0_0_1___21025/default'
for the_file in os.listdir(folder):
    file_path = os.path.join(folder, the_file)
    try:
        if os.path.isfile(file_path):
            os.unlink(file_path)
        #elif os.path.isdir(file_path): shutil.rmtree(file_path)
    except Exception as e:
        print(e)

# Copy all js files to the deploy directory
project_dir = os.path.dirname(os.path.realpath(__file__))
for file in os.listdir(project_dir):
    if str(file)[-3:] == '.js':
        with open(str(file), 'r') as read_file:
            lines = read_file.readlines()
            with open(folder+'/'+str(file), 'w') as write_file:
                write_file.writelines(lines)
