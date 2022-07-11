import pytest
#from backend import email_notifier as em
import json
from backend.status_db import *
import datetime

"""
status_ddb = get_status_table("us-west-2")
dummy_status = {"request_id": "dummy", "status": StatusEnum.STARTED.name, "timestamp": datetime.datetime.now().isoformat()}
status_data = StatusData(set_status_data(dummy_status, StatusAttribute.REQUEST_ID),
                            set_status_data(dummy_status, StatusAttribute.STATUS),
                            set_status_data(dummy_status, StatusAttribute.TIMESTAMP))
status_ddb.create_status_entry(status_data)
status_ddb.update_status("dummy", StatusEnum.SUCCESS.name)
status_ddb.delete_status("dummy",StatusEnum.SUCCESS.name)

"""

def create_status_data(id: str, status: str, timestamp: str, teardown: list[str]) -> StatusData:
    '''
    Helper method to create a StatuData object from input params
    '''
    dummy_status = {"request_id": id, "status": status, "timestamp": timestamp}
    status_data = StatusData(set_status_data(dummy_status, StatusAttribute.REQUEST_ID),
                                set_status_data(dummy_status, StatusAttribute.STATUS),
                                set_status_data(dummy_status, StatusAttribute.TIMESTAMP))
    teardown.append(id)
    return status_data

@pytest.fixture
def teardown() -> None:
    '''
    Deletes any records added by the test cases.
    '''
    test_records = []             # list containing ids of records added in tests
    
    yield test_records
    
    if (len(test_records) != 0):
        status_ddb = get_status_table("us-west-2")
        for id in test_records:
            try:
                status_ddb.delete_status(id, StatusEnum.SUCCESS.name)
            except:
                pass


@pytest.mark.parametrize(
    "id,status,timestamp",
    [
        (
            "1",
            StatusEnum.STARTED.name,
            datetime.datetime.now().isoformat()
        ),
        (
            "2",
            StatusEnum.IN_PROGRESS.name,
            datetime.datetime.now().isoformat()
        ),
        (
            "3",
            StatusEnum.SUCCESS.name,
            datetime.datetime.now().isoformat()
        ),
        (
            "4",
            StatusEnum.FAILED.name,
            datetime.datetime.now().isoformat()
        )        
    ],
)
def test_status_entry(id, status, timestamp, teardown):
    status_ddb = get_status_table("us-west-2")
    status_data = create_status_data(id, status, timestamp, teardown)
    output = status_ddb.create_status_entry(status_data)
    assert output == "Success"


@pytest.mark.parametrize(
    "id,status,timestamp",
    [
        (
            None,                                      # missing id
            StatusEnum.SUCCESS.name,
            datetime.datetime.now().isoformat()
        ),
        (
            "2",
            None,                                      # missing status
            datetime.datetime.now().isoformat()
        ),
        (
            "3",
            StatusEnum.SUCCESS.name,
            None                                       # missing timestamp
        ),
        (
            "dummy",                                   # invalid id, should only be numbers in string format (i think)
            StatusEnum.SUCCESS.name,
            datetime.datetime.now().isoformat()
        ),
        (
            5,                                         # invalid id type (should be string)
            StatusEnum.SUCCESS.name,
            datetime.datetime.now().isoformat()
        ),
        (
            "6",
            "random status string",                    # invalid status type (should be one of the elements of StatusEnum)
            datetime.datetime.now().isoformat()
        )
    ]
)
def test_status_entry_invalid_param(id, status, timestamp, teardown):
    status_ddb = get_status_table("us-west-2")
    status_data = create_status_data(id, status, timestamp, teardown)
    with pytest.raises(ValueError) as err:
        status_ddb.create_status_entry(status_data)
    

@pytest.mark.parametrize(
    "id,status,timestamp",
    [
        (
            "1",
            StatusEnum.STARTED.name,
            datetime.datetime.now().isoformat()
        ),
    ],
)    
def test_status_entry_duplicates(id, status, timestamp, teardown):
    status_ddb = get_status_table("us-west-2")
    status_data1 = create_status_data(id, status, timestamp, teardown)
    output1 = status_ddb.create_status_entry(status_data1)
    assert output1 == "Success"
    
    # If request_id already exists, it should not be altered by create_status_entry
    status_data2 = create_status_data(id, status, timestamp, teardown)    
    with pytest.raises(ValueError) as err:
        status_ddb.create_status_entry(status_data2)
    status_ddb.delete_status(id, StatusEnum.SUCCESS.name)
    


def valid_status_entry_helper(id: str, status: str, timestamp: str, teardown: list[str], status_ddb: StatusDDBUtil) -> None:
    """
    Helper method to temporarily add records in DynamoDB table to test get_record, update_status, and delete_status functions
    """
    status_data = create_status_data(id, status, timestamp, teardown)
    status_ddb.create_status_entry(status_data)