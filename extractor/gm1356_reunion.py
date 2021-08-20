from msvcrt import kbhit
from datetime import datetime
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
import pywinusb.hid as hid
import time
import sys
import requests


VENDOR_ID = 0x64BD
PRODUCT_ID = 0x74E3

CMD_BUFFER = [0x00, 0xb3, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
SAMPLE_DELAY = 0.5

API_KEY = "wda4&eWeZUiXLCNh^2Lus8w74Hjcpih*"
POST_URL = f"http://localhost:3000/api/rtin?api_key={API_KEY}"

_DB_VALUE_0 = None


def get_dB(value1, value2):
  """ Calculate the dB value out of two bytes information """
  dB = (value1*256 + value2)*0.1
  return dB


def sample_handler(data):
  global _DB_VALUE_0
  dB = get_dB(data[1], data[2])
  if _DB_VALUE_0:
    avg = round((_DB_VALUE_0 + dB) / 2, 1)
    print(
        f"AVG computed: {avg} at {datetime.now().time().strftime('%H:%M:%S')}")
    data = {'value': avg}
    requests.post(POST_URL, data)
    _DB_VALUE_0 = None
  else:
    _DB_VALUE_0 = dB
  return


if __name__ == "__main__":
  dev = hid.HidDeviceFilter(
      vendor_id=VENDOR_ID, product_id=PRODUCT_ID).get_devices()[0]
  try:
    dev.open()
    dev.set_raw_data_handler(sample_handler)
  except:
    dev.close()
    sys.exit(1)

  while not kbhit() and dev.is_plugged():
    dev.send_output_report(CMD_BUFFER)
    time.sleep(SAMPLE_DELAY)
