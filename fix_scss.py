import sys

def main():
    with open('scss/pc/mypage/myProfile.scss', 'r') as f:
        lines = f.readlines()
    
    # Find the block we appended (from line 1378 onwards)
    appended_lines = lines[1376:]
    original_lines = lines[:1376] # Up to the last closing brace

    # We need to find the closing braces in original_lines
    # The structure should be:
    # 1373:			} // .profile-content-area
    # 1374:		} // #my-profile-page
    # 1375:	} // #pc-wrap
    # 1376:}
    
    # We will just write original_lines[:-3] + appended_lines + original_lines[-3:]
    
    with open('scss/pc/mypage/myProfile.scss', 'w') as f:
        f.writelines(original_lines[:-3])
        f.writelines(appended_lines)
        f.writelines(original_lines[-3:])

if __name__ == '__main__':
    main()
