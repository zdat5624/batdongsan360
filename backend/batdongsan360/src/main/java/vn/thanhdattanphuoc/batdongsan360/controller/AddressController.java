package vn.thanhdattanphuoc.batdongsan360.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vn.thanhdattanphuoc.batdongsan360.domain.address.District;
import vn.thanhdattanphuoc.batdongsan360.domain.address.Province;
import vn.thanhdattanphuoc.batdongsan360.domain.address.Ward;
import vn.thanhdattanphuoc.batdongsan360.service.AddressService;

@RestController
public class AddressController {

    private AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping("/api/address/provinces")
    public ResponseEntity<List<Province>> getProvinces() {
        return ResponseEntity.ok(addressService.getAllProvinces());
    }

    @GetMapping("/api/address/districts/{code}")
    public ResponseEntity<List<District>> getDistricts(@PathVariable("code") long code) {
        return ResponseEntity.ok(addressService.getDistrictsByProvince(code));
    }

    @GetMapping("/api/address/wards/{code}")
    public ResponseEntity<List<Ward>> getWards(@PathVariable("code") long code) {
        return ResponseEntity.ok(addressService.getWardsByDistrict(code));
    }
}
