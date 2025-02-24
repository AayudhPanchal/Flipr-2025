from googlenewsdecoder import gnewsdecoder

def main():
    interval_time = 1  # interval is optional, default is None

    source_url = "https://news.google.com/./read/CBMizwJBVV95cUxNNFpyaEJaMnh1TUEwVnpzWUEyYjVibW9penkyTXFuT3FxMzF1Vkg0MHlsUXpMV1Qtb2NseV8yRG05NFlyNG1SYkxibVZNb2FXODBjVWpTZmVET2JlcFV6Ny1kY1NGVGpkWGN1Y2lsOUtoTzhQS1NVaW5mZTRrQVZaUlNNSE5RSkFiak1CLVp6eGFPTGd6bUNuSldpZGF5WEJIRTZQM25SZ0dHZ2FkNllRT2t1TFd3WUwyd0F0eUpZOEdONWkxVUtZaFp4MTUxYm0zRnFjaHNWb3dZRjZrVFNQY1pYSWFUTENDdkZ3c1VNNGloSzlIeE5uRFVHYkZnU2YxTjhxcDZoeWZUeGRxS29ZbTV5TF9TUk1tb0k3VlAzeVFKc0NPUEl2YWpidHFPcGdaY2NyMEdDMHlLVEtsSWFibEM4WWxtR0tob05uVUVxc9IB1AJBVV95cUxNYW0tQVZLTmExR3U0QVBoSVoyajFHUlB3SXJtN0RPQld0QmZVQnVKSXpnNGY5bTZuem1iN0ZSM0Fja0VmeHpuWXJjOFN2QnZYaFB0WUttdnJFMTk1QmpteHhlVnNnNW9YSHNlMFF1ZUh1M3NhUENGZFRyWER3T3JqbUpFRlg2XzBDc2FPYjdpcDFlQzZSMUdOZ01QeVNlbUNDTmlmVUtyWC1UdEdlZXNyVnpPQ1pNbVVaNktaSFBXcC1oUFBlZTItX1k1OWxOVi0tbjREQmtXTXZZcDJ4QzJ6em1MWVRDUWk2YXZFbC1IZUhJTWlEbnF2QUlFT3NvX1UwUnJmMUdjTUdpNnBZdnhNb3lMSWlmY2xjMnhsbnRQRWgtZmRwUGhHb0hWVDNncGxacU9QQlBMcW1LczNEVUo4OTVfWHVrUi11dWhIOWtxZmtyZW1V?hl%3Den-IN%26gl%3DIN%26ceid%3DIN%253Aen"

    try:
        decoded_url = gnewsdecoder(source_url)

        if decoded_url.get("status"):
            print("Decoded URL:", decoded_url["decoded_url"])
        else:
            print("Error:", decoded_url["message"])
    except Exception as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    main()