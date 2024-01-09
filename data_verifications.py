import base64
import io
from PIL import Image
import bleach


def compress_base64_image(
    image: str,
    height: int,
    width: int,
    quality: int,
    compress_only_if_larger_than_in_kb: int = 0,
):
    # Convert base64 to image
    original_image = image
    split_string = image.split(",")
    if (
        split_string[0] == "data:image/jpeg;base64"
        or split_string[0] == "data:image/png;base64"
        or split_string[0] == "data:image/jpg;base64"
        or split_string[0] == "data:image/webp;base64"
        or split_string[0] == "data:image/gif;base64"
    ):
        image = split_string[1]
    image = base64.b64decode(image)
    # Get size of image in kb.
    image_size = len(image) / 1024
    if image_size < compress_only_if_larger_than_in_kb:
        return original_image
    image = Image.open(io.BytesIO(image))
    # Resize image
    image.thumbnail((height, width))

    # Save the resized image as a new base64 string with compression
    output_buffer = io.BytesIO()
    original_image_format = split_string[0]
    original_image_format = original_image_format.split(";")[0]
    original_image_format = original_image_format.split(":")[1]
    original_image_format = original_image_format.split("/")[1]
    print(original_image_format)
    # Format as original.
    image.save(output_buffer, format=original_image_format, quality=quality)
    compressed_base64_image = base64.b64encode(output_buffer.getvalue())
    compressed_base64_image = compressed_base64_image.decode("utf-8")
    return split_string[0] + "," + compressed_base64_image


def compress_base64_image_for_posts(
    image: str,
    target_size: int = 0,
):
    """The target size is in kb. And image is the base64 string."""
    # Convert base64 to image
    original_image = image
    split_string = image.split(",")
    if (
        split_string[0] == "data:image/jpeg;base64"
        or split_string[0] == "data:image/png;base64"
        or split_string[0] == "data:image/jpg;base64"
        or split_string[0] == "data:image/webp;base64"
        or split_string[0] == "data:image/gif;base64"
    ):
        image = split_string[1]
    image = base64.b64decode(image)
    # Get size of image in kb.
    image_size = len(image) / 1024
    if image_size < target_size:
        return original_image
    image = Image.open(io.BytesIO(image))
    # Save the resized image as a new base64 string with compression
    width, height = image.size
    max_size = 800  # Maximum size for either width or height
    if width > height:
        if width > max_size:
            width = max_size
            height = int((max_size / image.width) * image.height)
    else:
        if height > max_size:
            height = max_size
            width = int((max_size / image.height) * image.width)
    image.thumbnail((width, height), Image.ANTIALIAS)
    quality = 95  # Starting quality
    original_image_format = split_string[0]
    original_image_format = original_image_format.split(";")[0]
    original_image_format = original_image_format.split(":")[1]
    original_image_format = original_image_format.split("/")[1]
    # Format as original.
    while True:
        output = io.BytesIO()
        image.thumbnail((width, height), Image.ANTIALIAS)
        image.save(output, format=original_image_format, quality=quality)
        compressed_base64 = base64.b64encode(output.getvalue()).decode("utf-8")
        if len(compressed_base64) / 1024 <= target_size:
            break
        quality -= 5
        if quality <= 5:
            break
    # Compress the image while keeping the aspect ratio
    return split_string[0] + "," + compressed_base64


_multiplication_table = (
    (0, 1, 2, 3, 4, 5, 6, 7, 8, 9),
    (1, 2, 3, 4, 0, 6, 7, 8, 9, 5),
    (2, 3, 4, 0, 1, 7, 8, 9, 5, 6),
    (3, 4, 0, 1, 2, 8, 9, 5, 6, 7),
    (4, 0, 1, 2, 3, 9, 5, 6, 7, 8),
    (5, 9, 8, 7, 6, 0, 4, 3, 2, 1),
    (6, 5, 9, 8, 7, 1, 0, 4, 3, 2),
    (7, 6, 5, 9, 8, 2, 1, 0, 4, 3),
    (8, 7, 6, 5, 9, 3, 2, 1, 0, 4),
    (9, 8, 7, 6, 5, 4, 3, 2, 1, 0),
)

_permutation_table = (
    (0, 1, 2, 3, 4, 5, 6, 7, 8, 9),
    (1, 5, 7, 6, 2, 8, 3, 0, 9, 4),
    (5, 8, 0, 3, 7, 9, 6, 1, 4, 2),
    (8, 9, 1, 6, 0, 4, 3, 5, 2, 7),
    (9, 4, 5, 3, 1, 2, 6, 8, 7, 0),
    (4, 2, 8, 6, 5, 7, 3, 9, 0, 1),
    (2, 7, 9, 3, 8, 0, 6, 4, 1, 5),
    (7, 0, 4, 6, 9, 1, 3, 2, 5, 8),
)


class Verhoeff:
    def checksum(number):
        """Calculate the Verhoeff checksum over the provided number. The checksum
        is returned as an int. Valid numbers should have a checksum of 0."""
        # transform number list
        number = tuple(int(n) for n in reversed(str(number)))
        # calculate checksum
        check = 0
        for i, n in enumerate(number):
            check = _multiplication_table[check][_permutation_table[i % 8][n]]
        return check

    def validate(number):
        """Check if the number provided passes the Verhoeff checksum."""
        if not bool(number):
            raise Exception("Empty value provided")
        try:
            valid = Verhoeff.checksum(number) == 0
        except Exception:  # noqa: B902
            raise Exception("Invalid value provided")
        if not valid:
            raise Exception("Invalid checksum")
        return number

    def is_valid(number):
        """Check if the number provided passes the Verhoeff checksum."""
        try:
            return bool(Verhoeff.validate(number))
        except Exception:
            return False

    def calc_check_digit(number):
        """Calculate the extra digit that should be appended to the number to
        make it a valid number."""
        return str(_multiplication_table[Verhoeff.checksum(str(number) + "0")].index(0))


def stringVerification(inputs: str, maxLimit: int = 0, minLimit: int = 1) -> bool:
    """Verify if string is valid. By checking if it is not empty and not none and does not have escape characters."""
    if inputs:
        if inputs != None:
            if len(inputs) >= minLimit:
                inputs = str(inputs)
                return True
    raise ValueError("Invalid string")


def emailVerification(email: str) -> bool:
    """Verify if email is valid. By checking if it is not empty and not none and has @ and . in it. There must
    not be + or . at the first part of the email (Which is a split of @)."""
    split_email = email.split("@")
    if len(split_email) == 2:
        if len(split_email[0]) > 3:
            if len(split_email[1]) > 1:
                if "." in split_email[1]:
                    if "+" not in split_email[0]:
                        if "." not in split_email[0]:
                            return True
    raise ValueError("Invalid email")


def passwordVerification(password: str) -> bool:
    """Verify if password is valid. By checking if it is not empty and not none and has more than 8 characters."""
    if len(password) > 8:
        return True
    else:
        raise ValueError("Invalid password")


def split_string_by_attherate(stringer: str):
    """Split string by @."""
    return stringer.split("@")


def split_string_by_commaseperator(stringer: str):
    """Split string by ,."""
    return stringer.split(",")


def base64_image_verification(stringer: str):
    """Verify if string is base64."""
    split_string = stringer.split(",")
    if (
        split_string[0] == "data:image/jpeg;base64"
        or split_string[0] == "data:image/png;base64"
        or split_string[0] == "data:image/jpg;base64"
        or split_string[0] == "data:image/webp;base64"
        or split_string[0] == "data:image/gif;base64"
    ):
        if base64.b64decode(split_string[1]):
            return True
    raise ValueError("Invalid base64")


def base64_pdf_verification(stringer: str):
    """Verify if string is base64."""
    split_string = stringer.split(",")
    if split_string[0] == "data:application/pdf;base64":
        if base64.b64decode(split_string[1]):
            if len(base64.b64decode(split_string[1])) / 1024 <= 1024:
                return True
    raise ValueError("Invalid base64")


def post_id_verification(stringer: str):
    """Verify if string is equals the mongoDB id length and if it is a string."""
    if len(stringer) == 24:
        if type(stringer) == str:
            return True
    else:
        raise ValueError("Invalid post id")


def convert_base64_to_file(stringer: str):
    """Convert base64 to io_object."""
    split_string = stringer.split(",")
    if (
        split_string[0] == "data:image/jpeg;base64"
        or split_string[0] == "data:image/png;base64"
        or split_string[0] == "data:image/jpg;base64"
        or split_string[0] == "data:image/webp;base64"
        or split_string[0] == "data:image/gif;base64"
    ):
        IO_File = io.BytesIO(base64.b64decode(split_string[1]))
        return IO_File
    elif split_string[0] == "data:application/pdf;base64":
        IO_File = io.BytesIO(base64.b64decode(split_string[1]))
        return IO_File
    else:
        raise ValueError("Invalid base64 , not jpeg or png or jpg or pdf")


def stringVerification_for_cards(inputs: dict) -> bool:
    """Verify if string is valid. If none, change it to No."""
    if len(inputs.keys()) > 10:
        #    print(len(inputs.keys))
        raise ValueError("Too many keys")
    r1 = inputs.copy()
    for i in inputs:
        if inputs[i] == None or inputs[i] == "" or inputs[i] == "none":
            del r1[i]
            continue
        if inputs[i]:
            if inputs[i] != None:
                if len(inputs[i]) > 0:
                    r1[i] = str(inputs[i])
        else:
            raise ValueError("Invalid string")
    # print(r1)
    return r1


def sanitize_html(html: str):
    """Sanitize HTML."""
    tags = [
        "p",
        "b",
        "i",
        "u",
        "s",
        "ul",
        "ol",
        "li",
        "blockquote",
        "hr",
        "br",
        "table",
        "thead",
        "tbody",
        "th",
        "tr",
        "td",
        "strong",
        "em",
        "strike",
        "div",
        "span",
    ]

    # return bleach.clean(html, tags=[], attributes={}, styles=[], strip=True)
    return bleach.clean(html, tags=tags, attributes={}, strip=True)


def check_if_only_on_or_off(stringer: str):
    """Check if string is only on or off."""
    if stringer == "on" or stringer == "off":
        return True
    raise ValueError("Invalid string")


def verify_if_string_is_a_https_link(stringer: str):
    """Verify if string is a https link."""
    if stringer.startswith("https://"):
        return True
    raise ValueError("Invalid link")


class structured_verifiers:
    def string_in_list_verification(stringer: str, lister: list):
        """Verify if string is in list."""
        if stringer in lister:
            return True
        raise ValueError("Invalid string")

    def string_verification(stringer: str, minLength: int, maxLength: int):
        """Verify if string is valid. By checking if it is not empty and not none and does not have escape characters."""
        if stringer:
            if len(stringer) >= minLength:
                if len(stringer) <= maxLength:
                    stringer = str(stringer)
                    return True
        raise ValueError("Invalid string")

    def email_verification(
        stringer: str, minLength: int, maxLength: int, allowed_domains: list
    ):
        """Verify if email is valid. By checking if it is not empty and not none and has @ and . in it.
        There must not be + or . at the first part of the email (Which is a split of @).
        Also, check if the email is in the allowed domains."""
        split_email = stringer.split("@")
        if len(split_email) == 2:
            if len(split_email[0]) > minLength:
                if len(split_email[1]) > minLength:
                    if "." in split_email[1]:
                        if "+" not in split_email[0]:
                            if "." not in split_email[0]:
                                if split_email[1] in allowed_domains:
                                    return True
        raise ValueError("Invalid email")
