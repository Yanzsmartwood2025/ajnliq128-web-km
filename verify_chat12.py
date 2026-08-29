import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await page.goto('http://localhost:3000/aria/starlight-log')

        await page.wait_for_timeout(2000)

        print("Flipping pages by dragging...")
        for i in range(12):
            await page.mouse.move(1100, 400)
            await page.mouse.down()
            await page.mouse.move(300, 400, steps=20)
            await page.mouse.up()
            await page.wait_for_timeout(800)

        await page.screenshot(path='/home/jules/verification/screenshots/drag_flipped.png')

        chat_input = page.locator('.chat-input').first
        print("Waiting for chat input...")
        try:
            if await chat_input.is_visible():
                print("Chat input is visible!")
                await chat_input.fill("Hello arIA!")
                await page.keyboard.press("Enter")
                await page.wait_for_timeout(2000)
                await page.screenshot(path='/home/jules/verification/screenshots/chat_message_sent.png')
            else:
                print("Chat input not visible after dragging.")
                # Force fill anyway
                await chat_input.fill("Hello arIA (forced)!", force=True)
                await chat_input.press("Enter")
                await page.wait_for_timeout(2000)
                await page.screenshot(path='/home/jules/verification/screenshots/chat_message_forced.png')
        except Exception as e:
            print("Exception:", e)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
