package com.qlda.workflowservice.client.dto;

import java.util.List;

public record ValidateUsersInternalRequest(List<Long> userIds) {
}
