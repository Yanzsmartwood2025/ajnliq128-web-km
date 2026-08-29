from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800},
            device_scale_factor=1,
        )
        page = context.new_page()

        print("Navigating to Starlight Log...")
        # The book is at /aria/starlight-log
        page.goto("http://localhost:3000/aria/starlight-log")

        # Wait a moment for it to load
        page.wait_for_timeout(3000)
        page.screenshot(path="/home/jules/verification/screenshots/starlight_load11.png")
        print("Took screenshot of initial load.")

        print("Attempting to flip pages to find the chat...")
        for i in range(7):
            print(f"Flipping page {i+1}...")
            # Click the right side of the screen to turn the page
            page.mouse.click(1200, 400)
            page.wait_for_timeout(1000)

            # Check if chat input is visible
            chat_input = page.query_selector("input.chat-input")
            if chat_input:
                print("Found chat input!")
                page.screenshot(path="/home/jules/verification/screenshots/chat_found11.png")

                print("Typing a message...")
                chat_input.fill("Hello, arIA! Are you in the book?")
                page.keyboard.press("Enter")
                page.wait_for_timeout(3000)
                page.screenshot(path="/home/jules/verification/screenshots/chat_message_sent11.png")
                break
        else:
            print("Did not find chat input after 7 flips.")
            page.screenshot(path="/home/jules/verification/screenshots/final_state11.png")

        browser.close()

run()
