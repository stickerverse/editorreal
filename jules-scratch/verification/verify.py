from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Get the absolute path to the HTML file
        html_file_path = os.path.abspath('index.html')

        # Go to the local HTML file
        page.goto(f'file://{html_file_path}')

        # Upload the image
        page.set_input_files('input#file-upload', 'jules-scratch/verification/cat.jpg')

        # Add a small delay to allow FileReader to process
        page.wait_for_timeout(2000)

        # Wait for the image to be loaded on the canvas
        page.wait_for_selector('.canvas-container .upper-canvas', timeout=10000)

        # Click the edit tab
        page.click('button[data-tab="edit"]')

        # Wait for the edit tab to be active
        page.wait_for_selector('#tab-edit-content.active')

        # Click the remove background button
        page.click('#remove-bg-btn')

        # Wait for the background removal to process
        # This can take a while, so we'll wait for a reasonable amount of time.
        # A better approach would be to watch for a specific element or event,
        page.wait_for_timeout(20000) # 20 seconds

        # Take a screenshot
        page.screenshot(path='jules-scratch/verification/verification.png')

        browser.close()

if __name__ == '__main__':
    run()
