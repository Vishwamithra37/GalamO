import math


def check_if_category_2_is_exponential(current_count: int):
    # Check if the current count is exponential rounded off.
    if current_count == 0:
        return False
    if current_count == 1:
        return True
    elif current_count == 2 ** int(math.log(current_count, 2)):
        return True
    return False
