def check_number(number):
    for n in range(2,number):
        if number % n == 0:
            print(n)
            print('Not simple')
            break
    else:
        print('simple')



check_number((19))