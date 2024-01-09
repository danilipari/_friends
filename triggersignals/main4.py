import datetime
import os
import schedule
import time
from telethon import TelegramClient, events
from dotenv import load_dotenv

load_dotenv()

api_id = os.getenv('API_ID')
api_hash = os.getenv('API_HASH')
username = os.getenv('USERNAME_SHARE')

now = datetime.datetime.now()
today = datetime.date.today()
yesterday = today - datetime.timedelta(days=1)

client = TelegramClient('triggersignals', api_id, api_hash)

async def main():
  group_name = 'TFXC_FREE'
  group_entity = await client.get_input_entity(group_name)
  group_id = group_entity.channel_id

  message_sent = False

  async for message in client.iter_messages(group_id, offset_date=yesterday, reverse=True):
    if message.text.startswith('SIGNAL ALERT'):
      messages = await client.get_messages(username, search=message.text)
      if not messages.total:
        await client.send_message(username, message.text)
        print(message.text)
      else:
        print(f"Nessun nuovo ALERT nella chat con '{username}' {now.strftime('%d/%m/%Y %H:%M:%S')}")
        message_sent = True
        break

def job():
  with client:
    client.loop.run_until_complete(main())

schedule.every(1.5).seconds.do(job) # only for testing purposes
# schedule.every(5).minutes.do(job) # for production

while True:
  schedule.run_pending()
  time.sleep(1)