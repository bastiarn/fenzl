from msvcrt import kbhit
from datetime import datetime
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
import pywinusb.hid as hid
import time
import sys

#INFLUX_URL = "http://localhost:8086"
#INFLUX_TOKEN = "NMCo826IPo1GQcSyGtgKdLtGLW_9n1ldJFc5WCS3LPVsiRYZGylQhs6_yFShV_KwdHs6oqZMznspl2WVy3s3Zg=="
#INFLUX_ORG = "reunion-org"
#INFLUX_BUCKET = "gm1356"

VENDOR_ID = 0x64BD
PRODUCT_ID = 0x74E3

CMD_BUFFER = [0x00, 0xb3, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
SAMPLE_DELAY = 0.5

#client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
#write_api = client.write_api(write_options=SYNCHRONOUS)


def get_dB(value1, value2):
    """ Calculate the dB value out of two bytes information """
    dB = (value1*256 + value2)*0.1
    return f"{dB:.1f}"
def sample_handler(data):
    dB = get_dB(data[1], data[2])
    print(dB)
    #p = Point("Pegel").field("value", dB).time(datetime.utcnow(), WritePrecision.S)
    #write_api.write(bucket=INFLUX_BUCKET, record=p)
    return


if __name__ == "__main__":
  dev = hid.HidDeviceFilter(vendor_id = VENDOR_ID, product_id = PRODUCT_ID).get_devices()[0]
  try:
    dev.open()
    dev.set_raw_data_handler(sample_handler)
  except:
    dev.close()
    sys.exit(1)

  while not kbhit() and dev.is_plugged():
    dev.send_output_report(CMD_BUFFER)
    time.sleep(SAMPLE_DELAY)

